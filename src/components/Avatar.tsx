import React from 'react';

interface AvatarProps {
  src: string;
  alt: string;
  link: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt = "Sponsor logo", link="/", className }) => {
  return (
    <a href={link}>
      <div className={`flex items-center justify-center w-20 h-20 rounded-full overflow-hidden mx-4 mb-10 bg-[#d9d9d9] ${className || ''}`}>
        
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <span className="text-center font-medium">{alt}</span>
        )}
        
      </div>
    </a>
  );
};

export default Avatar;

