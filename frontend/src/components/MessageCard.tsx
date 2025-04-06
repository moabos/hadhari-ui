import { Message } from 'shared/types';

interface MessageCardProps {
  message: Message;
  type?: 'active' | 'default';
}

function MessageCard({ message, type = 'default' }: MessageCardProps) {
  const isSpam = message.prediction === 'Spam';
  const isActive = type === 'active';
  const opacity = isActive ? 'opacity-100' : 'opacity-50';
  const scale = isActive ? 'scale-100' : 'scale-75';

  async function handleCopy() {
    await navigator.clipboard.writeText(message.id);
  }

  return (
    <div
      className={`relative flex flex-col ${opacity} ${scale} w-11/12 items-center gap-2 border-2 border-black p-2 text-white md:w-1/2`}
      style={{ backgroundColor: isSpam ? '#b34747' : '#60AC7B' }}
    >
      <img
        src="/copy.png"
        alt="message"
        className="absolute -top-1 right-2 z-0 scale-75 border-2 border-black bg-slate-700 p-2 hover:cursor-pointer"
        onClick={() => {
          void handleCopy();
        }}
      />

      <div>
        <span className="font-bold text-black">{message.confidence * 100}%</span>
        <span className={`px-2 font-bold ${isSpam ? 'text-red-300' : 'text-green-300'}`}>
          {message.prediction}
        </span>
      </div>
      <span style={{ overflowWrap: 'anywhere', direction: 'rtl' }}>{message.raw_message}</span>
      <span className="mt-auto font-bold text-black">{message.sender_number}</span>
    </div>
  );
}

export default MessageCard;
