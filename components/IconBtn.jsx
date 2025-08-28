import Icon from "@/components/Icon"

const IconBtn = ({ onClick, icon, className="", size="5" }) => {

  const WrapperSize = "size-" + size;
  const WrapperClassName = `rounded-md text-white ${WrapperSize} ${className}
                            duration-200
                            hover:opacity-50 active:opacity-40 cursor-pointer`
  // console.log(WrapperClassName);
  return (
    <button onClick={onClick} className={WrapperClassName}>
      <Icon name={icon} size={size} />
    </button>
  );
};

export default IconBtn;