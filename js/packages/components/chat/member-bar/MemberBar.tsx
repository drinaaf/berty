import LottieView from 'lottie-react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import beapi from '@berty/api'
import {
	useAppDispatch,
	useAppSelector,
	useConversationMembers,
	useMessengerClient,
} from '@berty/hooks'
import { useNavigation } from '@berty/navigation'
import {
	getPeerFromMemberPK,
	PeerNetworkStatus,
	selectGroupsDevicesToPeerDict,
	selectPeerNetworkStatusDict,
} from '@berty/redux/reducers/messenger.reducer'

import { Avatars } from './Avatars'
import { Boosted } from './Boosted'
import { MemberBarItem } from './interfaces'

interface MemberBarProps {
	convId: string
}

export const MemberBar: React.FC<MemberBarProps> = props => {
	const navigation = useNavigation()
	const [animationStep, setAnimationStep] = useState(0)
	const messengerClient = useMessengerClient()
	const dispatch = useAppDispatch()
	const peers = useAppSelector(selectPeerNetworkStatusDict)
	const groups = useAppSelector(selectGroupsDevicesToPeerDict)

	const convMembers = useConversationMembers(props.convId)
	const members = useMemo(() => convMembers.filter(members => !members.isMe), [convMembers])

	const [memberList, setMemberList] = useState<MemberBarItem[] | undefined>(undefined)
	const [isOneConnected, setIsOneConnected] = useState<boolean>(false)

	const cometAnim = useRef<LottieView>(null)

	const handleMemberList = useCallback(async () => {
		const list: MemberBarItem[] = []

		if (!messengerClient) {
			return
		}

		let connected: boolean = false
		for (const member of members) {
			const action = await dispatch(
				getPeerFromMemberPK({ memberPK: member.publicKey, convPK: props.convId }),
			)
			const peer = action.payload as PeerNetworkStatus

			if (peer?.connectionStatus === beapi.protocol.GroupDeviceStatus.Type.TypePeerConnected) {
				connected = true
			}

			list.push({
				networkStatus: peer,
				publicKey: member.publicKey ?? undefined,
			})
			// TODO: find a optimized way to push in the list 5 interested peers and not 5 firsts members
			if (list.length >= 5) {
				break
			}
		}

		setIsOneConnected(connected)
		if (!connected) {
			// reset animation
			setAnimationStep(0)
		}

		setMemberList(
			list.sort((a, b) => {
				if (
					b?.networkStatus?.connectionStatus ===
						beapi.protocol.GroupDeviceStatus.Type.TypePeerConnected &&
					a?.networkStatus?.connectionStatus !==
						beapi.protocol.GroupDeviceStatus.Type.TypePeerConnected
				) {
					return 1
				}
				return -1
			}),
		)
	}, [dispatch, messengerClient, props.convId, members])

	useEffect(() => {
		handleMemberList()
		// we put peers/members/groups dependencies to update the connectionStatus of peers
	}, [handleMemberList, groups, peers, members])

	return (
		<TouchableOpacity
			onPress={() => navigation.navigate('Group.MultiMemberSettings', { convId: props.convId })}
			style={styles.container}
		>
			<View style={styles.barWidth}>
				{animationStep === 0 && (
					<LottieView
						autoPlay
						style={styles.lottieWidth}
						source={require('@berty/assets/lottie/network_status_animations/orange.json')}
						loop={false}
						speed={1}
						ref={cometAnim}
						onAnimationFinish={() => {
							if (isOneConnected) {
								setAnimationStep(1)
							} else {
								cometAnim.current?.play()
							}
						}}
					/>
				)}
				{animationStep === 1 && (
					<LottieView
						autoPlay
						style={styles.lottieWidth}
						source={require('@berty/assets/lottie/network_status_animations/blue.json')}
						onAnimationFinish={() => setAnimationStep(2)}
						loop={false}
					/>
				)}
				{animationStep === 2 && memberList !== undefined && (
					<Avatars convId={props.convId} membersLength={members.length} memberList={memberList} />
				)}
			</View>
			<Boosted />
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	container: {
		marginTop: 10,
		backgroundColor: 'white',
		borderRadius: 18,
		shadowOffset: {
			width: 0,
			height: 8,
		},
		shadowColor: 'black',
		shadowOpacity: 0.1,
		shadowRadius: 20,
		elevation: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 5,
		height: 40,
	},
	barWidth: {
		flex: 1,
		alignItems: 'center',
	},
	lottieWidth: {
		height: 8,
	},
})
