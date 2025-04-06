import { StatsBarProps } from '../../../shared/types';

function StatsBar({ spam, ham, validated, sessionValidated }: StatsBarProps) {
  const isLoading = spam === -1;
  return (
    <aside className="flex flex-col gap-2 border-2 border-black bg-gray-700 px-10 py-2 text-amber-100">
      <h1 className="mb-auto text-center font-bold">Stats</h1>
      <div>
        <p className={isLoading ? 'animate-pulse' : ''}>Spam: {isLoading ? '...' : spam}</p>
        <p className={isLoading ? 'animate-pulse' : ''}>Ham: {isLoading ? '...' : ham}</p>
        <p className={isLoading ? 'animate-pulse pt-2 font-semibold' : 'pt-2 font-semibold'}>
          Unvalidated: {isLoading ? '...' : spam + ham - validated}
        </p>
        <p className={`${isLoading ? 'animate-pulse' : ''} pt-2 font-semibold`}>
          Total Validated: {isLoading ? '...' : validated}
        </p>
        {validated > 0 && (
          <p className="pt-2 font-semibold"> Validated this session: {sessionValidated}</p>
        )}
      </div>
    </aside>
  );
}

export default StatsBar;
