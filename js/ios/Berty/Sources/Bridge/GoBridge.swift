//
//  GoBridge.swift
//  GoBridge
//
//  Created by Guilhem Fanton on 06/01/2020.
//  Copyright © 2020 Berty Technologies. All rights reserved.
//

import Foundation
import Bertybridge

struct BridgeError: LocalizedError {
    let value: String
    init(_ value: String)  {
        self.value = value
    }
    public var errorDescription: String? { return self.value }
}

@objc(GoBridge)
class GoBridge: NSObject {
    let logger = LoggerDriver("tech.berty", "react")

    // protocol
    var bridgeMessenger: BertybridgeBridge?
    let appRootDir: String
    let sharedRootDir: String

    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override init() {
        // set berty dir for persistence
        self.sharedRootDir = try! RootDirGet()
      
        let docDir = try! FileManager.default.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
        self.appRootDir = docDir.appendingPathComponent("berty", isDirectory: true).path

        super.init()
    }

    deinit {
      do {
        if self.bridgeMessenger != nil {
            try self.bridgeMessenger?.close()
            self.bridgeMessenger = nil
        }
      } catch let error as NSError {
        NSLog("\(String(describing: error.code))")
      }
    }

    @objc func clearStorage(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            if FileManager.default.fileExists(atPath: self.appRootDir) {
                try FileManager.default.removeItem(atPath: self.appRootDir)
            }
            if FileManager.default.fileExists(atPath: self.sharedRootDir) {
                try FileManager.default.removeItem(atPath: self.sharedRootDir)
            }
            resolve(true)
        }
        catch let error as NSError {
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
    }

    @objc func log(_ opts: NSDictionary) {
        #if !CFG_APPSTORE
        if let message = opts["message"] as? String {
            let type = opts["level"] as? String ?? "info"

            // set log level
            let level = Level(rawValue: type.uppercased()) ?? Level.info

            // log
            self.logger.print(message as NSString, level: level, category: "react-native")
        }
        #endif
    }

    // //////// //
    // Protocol //
    // //////// //

    @objc func initBridge(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            if self.bridgeMessenger != nil {
                throw NSError(domain: "tech.berty.gobridge", code: 1, userInfo: [NSLocalizedDescriptionKey : "already started"])
            }

            var err: NSError?
            guard let config = BertybridgeNewConfig() else {
                throw NSError(domain: "tech.berty.gobridge", code: 2, userInfo: [NSLocalizedDescriptionKey : "unable to create config"])
            }

            config.setLoggerDriver(LoggerDriver("tech.berty", "gomobile"))

            // get user preferred languages
            let preferredLanguages: String = Locale.preferredLanguages.joined(separator: ",")

            config.setLifeCycleDriver(LifeCycleDriver.shared)
            config.setNotificationDriver(NotificationDriver.shared)
            config.setKeystoreDriver(KeystoreDriver.shared)
            config.setPreferredLanguages(preferredLanguages)

            // @TODO(gfanton): make this dir in golang
            var isDirectory: ObjCBool = true
            var exist = FileManager.default.fileExists(atPath: self.sharedRootDir, isDirectory: &isDirectory)
            if !exist {
                try FileManager.default.createDirectory(atPath: self.sharedRootDir, withIntermediateDirectories: true, attributes: nil)
            }
          
            exist = FileManager.default.fileExists(atPath: self.appRootDir, isDirectory: &isDirectory)
            if !exist {
                try FileManager.default.createDirectory(atPath: self.appRootDir, withIntermediateDirectories: true, attributes: nil)
            }

            // Disable iOS backup
            var values = URLResourceValues()
            values.isExcludedFromBackup = true
          
            var appRootDirURL = URL(fileURLWithPath: self.appRootDir)
            try appRootDirURL.setResourceValues(values)

            var sharedRootDirURL = URL(fileURLWithPath: self.sharedRootDir)
            try sharedRootDirURL.setResourceValues(values)

            // Set root directories
            config.setAppRootDir(self.appRootDir)
            config.setSharedRootDir(self.sharedRootDir)

            let bridgeMessenger = BertybridgeNewBridge(config, &err)
            if err != nil {
                throw err!
            }

            self.bridgeMessenger = bridgeMessenger

            resolve(true)
        } catch let error as NSError {
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
    }

    @objc func closeBridge(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            if self.bridgeMessenger != nil {
                try self.bridgeMessenger?.close()
                self.bridgeMessenger = nil
            }
            resolve(true)
        } catch let error as NSError {
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
    }

    @objc func invokeBridgeMethod(_ method: String, b64message: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            guard let bridgeMessenger = self.bridgeMessenger else {
                throw NSError(domain: "tech.berty.gobridge", code: 3, userInfo: [NSLocalizedDescriptionKey : "bridgeMessenger isn't started"])
            }

            let promise = PromiseBlock(resolve, reject)
            bridgeMessenger.invokeBridgeMethod(with: promise, method: method, b64message: b64message)
        } catch let error as NSError {
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
    }

    @objc func getProtocolAddr(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
          if self.bridgeMessenger == nil {
              throw NSError(domain: "tech.berty.gobridge", code: 4, userInfo: [NSLocalizedDescriptionKey : "bridgeMessenger isn't started"])
          }

          let addr: [String] = []
          resolve(addr)
        } catch let error as NSError {
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
    }
}
