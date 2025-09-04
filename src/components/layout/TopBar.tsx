interface TopBarProps {
  message: string;
}

export default function TopBar({ message }: TopBarProps) {
  if (!message) return null;
  
  return (
    <div className="bg-purple-700 text-white py-2 px-4 overflow-hidden relative">
      <div className="whitespace-nowrap animate-scroll">
        <p className="text-sm sm:text-base inline-block">{message}</p>
      </div>
    </div>
  );
}