import React from 'react';

interface AvatarProps {
  src: string;
  alt: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt = 'Sponsor logo'}) => {
  return (
    <img
      src={src}
      alt={alt}
      className='h-20 w-20 rounded-full object-cover bg-[#d9d9d9] mx-4 text-center'
    />
  );
};

export default Avatar;
