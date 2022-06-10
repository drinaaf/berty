import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useAppSelector, useInteractionAuthor } from '@berty/hooks'
import { selectActiveReplyInteraction } from '@berty/redux/reducers/chatInputs.reducer'
import { useThemeColor } from '@berty/store'

import { UnifiedText } from '../../../shared-components/UnifiedText'
import { ReplyMessageProps } from './interface'

export const ContactReply: React.FC<ReplyMessageProps> = ({ convPK }) => {
	const colors = useThemeColor()
	const { text } = useStyles()
	const { t } = useTranslation()

	const activeReplyInteraction = useAppSelector(state =>
		selectActiveReplyInteraction(state, convPK),
	)
	const replyTargetAuthor = useInteractionAuthor(
		activeReplyInteraction?.conversationPublicKey || '',
		activeReplyInteraction?.cid || '',
	)

	return (
		<View
			style={[
				styles.contactReply,
				{ backgroundColor: colors['input-background'], borderColor: colors['positive-asset'] },
			]}
		>
			<UnifiedText
				numberOfLines={1}
				style={[text.size.tiny, { color: colors['background-header'] }]}
			>
				{t('chat.reply.replying-to')} {replyTargetAuthor?.displayName || ''}
			</UnifiedText>
		</View>
	)
}

const styles = StyleSheet.create({
	contactReply: {
		position: 'absolute',
		top: -20,
		alignSelf: 'center',
		paddingVertical: 2,
		paddingHorizontal: 20,
		borderWidth: 1,
		borderRadius: 20,
	},
})
