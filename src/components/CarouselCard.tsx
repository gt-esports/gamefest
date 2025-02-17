interface CarouselCardProps {
  image: string;
  name: string;
  link: string;
  center: boolean;
}

function CarouselCard(props: CarouselCardProps) {
  return (
    <div
      className={`h-full w-full text-center transition-transform duration-300 ${
        props.center ? "scale-100" : "scale-75"
      }`}
    >
      <a href={props.link}>
        <img 
          src={props.image} 
          className={`aspect-[3/4] w-full object-cover rounded-lg ${
            props.center ? "shadow-lg" : ""
          }`}
        />
      </a>
      <p className="py-4 font-barlow font-semibold tracking-wide text-white">
        {props.name}
      </p>
    </div>
  );
}

export default CarouselCard;
