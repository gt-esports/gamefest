import React from 'react';

interface AvatarProps {
  src: string;
  alt: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt = 'Sponsor logo', className }) => {
  return (
    <div className={`flex items-center justify-center w-20 h-20 rounded-full overflow-hidden mx-4 mb-10 bg-[#d9d9d9] ${className || ''}`}>
      <span className="text-center font-medium">{src}</span>
    </div>
  );
};

export default Avatar;

