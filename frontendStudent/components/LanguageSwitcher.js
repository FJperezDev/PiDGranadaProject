import {useLanguage} from '../context/LanguageContext';


export const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => toggleLanguage(e.target.value)}
        className="appearance-none bg-transparent border border-black rounded-md py-1 px-3 pr-8 text-black font-medium focus:outline-none"
      >
        <option value="es">Español</option>
        <option value="en">English</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.516 7.548c.436-.446 1.043-.481 1.576 0L10 10.405l2.908-2.857c.533-.481 1.141-.446 1.574 0 .436.445.408 1.197 0 1.615l-3.712 3.648c-.27.268-.62.398-.97.398s-.701-.13-1.028-.398L5.516 9.163c-.409-.418-.436-1.17 0-1.615z"/></svg>
      </div>
    </div>
  );
};