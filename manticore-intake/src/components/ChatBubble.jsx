export default function ChatBubble({ role, text }) {
  const isAi = role === 'ai'

  return (
    <div className={`flex ${isAi ? 'justify-start' : 'justify-end'} mb-3`}>
      {isAi && (
        <div className="w-7 h-7 rounded-full mr-2 mt-1 shrink-0 overflow-hidden">
          <img src="/images/lm-icon.png" alt="Manticore" className="w-full h-full object-cover rounded-full" />
        </div>
      )}
      <div className={isAi ? 'chat-bubble-ai' : 'chat-bubble-client'}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{text || '…'}</p>
      </div>
    </div>
  )
}
