'use client';

import WaltIcon from '@/components/walt/logo/WaltIcon';
import { AvailableCredential } from '@/types/credentials';

type Props = {
  id: string;
  title: string;
  description?: string;
  selected?: boolean;
  onClick: (id: string) => void;
};

export default function Credential({
  id,
  title,
  description,
  selected = false,
  onClick,
}: Props) {
  const blueDark = 'bg-gradient-to-r from-primary-400 to-primary-600';
  const blueLight = 'bg-gradient-to-r from-primary-700 to-primary-900';

  return (
    <div
      className={`group ${selected ? 'drop-shadow-2xl' : 'drop-shadow-md'} rounded-xl overflow-hidden cursor-pointer`}
      onClick={() => onClick(id)}
    >
      <div
        className={`flex flex-col justify-between h-[225px] w-[360px] p-6 ${selected ? blueLight : blueDark} transition-all duration-300 ease-in-out transform group-hover:scale-105`}
      >
        <div className="flex justify-between items-start">
          <WaltIcon height={35} width={35} outline type="white" />
          <div
            className={`text-sm font-semibold px-2 py-1 rounded-full text-white ${selected ? 'bg-primary-600' : 'bg-primary-700'}`}
            style={{ transition: 'background-color 300ms' }}
          >
            {selected ? 'Selected' : 'Select'}
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2 text-white">{title.length > 20 ? `${title.substring(0, 20)}...` : title}</h3>
          <p className="text-sm opacity-90 text-white">{description ? (description.length > 60 ? `${description.substring(0, 60)}...` : description) : 'No description available.'}</p>
        </div>
      </div>
    </div>
  );
}
