import React from 'react';

interface AvatarProps {
  src: string;
  alt: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt = 'Sponsor logo'}) => {
  return (
    <div className="flex flex-wrap w-24 h-24 rounded-full overflow-hidden mx-4 mb-10 bg-[#d9d9d9] items-center justify-center">
      <span className="text-white font-bold">{src}</span>
    </div>
  );
};

export default Avatar;

