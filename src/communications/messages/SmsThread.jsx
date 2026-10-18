import MessageConversation from './MessageConversation.jsx';

export default function SmsThread(props) {
  return <MessageConversation {...props} channel="text" />;
}
