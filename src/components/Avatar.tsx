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
      className='sm:size-16 md:size-24 rounded-full object-cover bg-[#d9d9d9] mx-4 mb-10 text-center'
    />
  );
};

export default Avatar;
