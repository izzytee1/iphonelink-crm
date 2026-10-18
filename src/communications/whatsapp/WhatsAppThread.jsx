import MessageConversation from '../messages/MessageConversation.jsx';

export default function WhatsAppThread(props) {
  return <MessageConversation {...props} channel="wa" />;
}
