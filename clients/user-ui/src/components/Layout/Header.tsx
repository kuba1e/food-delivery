import styles from "@/src/utils/style";
import ProfileDropDown from "../ProfileDropdown";
import NavItems from "../NavItems";

const Header = () => {
  return (
    <header className="w-full bg-[#0A0713]">
      <div className="w-[90%] m-auto h-[80px] flex items-center justify-between">
        <h1 className={`${styles.logo}`}>Becodemy</h1>
        <NavItems />
        <ProfileDropDown />
      </div>
    </header>
  );
};

export default Header;
