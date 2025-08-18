interface TopBarProps {
  message: string;
}

export default function TopBar({ message }: TopBarProps) {
  return (
    <div className="bg-purple-700 text-white text-center py-2 px-4">
      <p className="text-sm sm:text-base">{message}</p>
    </div>
  );
}