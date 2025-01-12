import React, { useEffect, useState } from 'react';
import './header.css';
// import { RiMessage2Line } from "react-icons/ri";
// import { CgProfile } from "react-icons/cg";
// import { slide as Menu } from "react-burger-menu";
// import "./Sidebar.css";
// import { useTranslation } from 'react-i18next';

// interface HeaderProps {
//     pageindex: number;
//     setpageIndex: React.Dispatch<React.SetStateAction<number>>;
//     userconnected: boolean;
//     setUserConnected: React.Dispatch<React.SetStateAction<boolean>>;
// }

// function Header({ pageindex, setpageIndex, userconnected, setUserConnected }: HeaderProps) {
//     const [shortHeader, setshortHeader] = useState(0)
//     const { i18n } = useTranslation();
//     const [flag, setFlag] = useState('https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg');

//     useEffect(() => {
//         const checkWidth = () => {
//             if (window.innerWidth < 1200) {
//                 setshortHeader(1);
//             } else {
//                 setshortHeader(0);
//             }
//         };
//         const intervalId = setInterval(checkWidth, 500);
//         return () => clearInterval(intervalId);
//     }, []);

//     const changeLanguage = (language: 'en' | 'fr') => {
//         i18n.changeLanguage(language);
//         setFlag(language === 'en'
//             ? 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg'
//             : 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg');
//     };
//     return (
//         <div style={{
//             display: 'flex', width: '100%', height: '7vh',
//             boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)', zIndex: 1000
//         }}>
//             {!userconnected ?
//                 <header className='headerbox'>
//                     <p>Soul Connection</p>
//                     <p>{i18n.t('Sign in')}</p>
//                 </header>
//                 :
//                 <header className='headerbox'>
//                     <div style={{ flexDirection: 'row' }}>
//                         {shortHeader === 1 &&
//                             <Menu className="burger-menu"
//                                 overlayClassName="burger-menu"
//                             >
//                                 <button className={pageindex === 1 ? 'buttonclicked' : 'buttonnavbar'}
//                                     onClick={() => setpageIndex(1)}>{i18n.t('Dashboard')}</button>
//                                 <button className={pageindex === 3 ? 'buttonclicked' : 'buttonnavbar'}
//                                     onClick={() => setpageIndex(3)}>{i18n.t('Customers')}</button>
//                                 <button className={pageindex === 4 ? 'buttonclicked' : 'buttonnavbar'}
//                                     onClick={() => setpageIndex(4)}>{i18n.t('Tips')}</button>
//                                 <button className={pageindex === 5 ? 'buttonclicked' : 'buttonnavbar'}
//                                     onClick={() => setpageIndex(5)}>{i18n.t('Events')}</button>
//                                 <button className={pageindex === 6 ? 'buttonclicked' : 'buttonnavbar'}
//                                     onClick={() => setpageIndex(6)}>{i18n.t('Astro')}</button>
//                                 <button className={pageindex === 7 ? 'buttonclicked' : 'buttonnavbar'}
//                                     onClick={() => setpageIndex(7)}>{i18n.t('Dressing')}</button>
//                             </Menu>
//                         }
//                         <h3 style={{
//                             fontSize: shortHeader === 1 ? '1em' : '1.5em',
//                             marginLeft: shortHeader === 1 ? "12vw" : '0'

//                         }}>Soul Connection</h3>
//                     </div>
//                     {shortHeader === 0 &&
//                         <div>
//                             <button className={pageindex === 1 ? 'buttonclicked' : 'buttonnavbar'}
//                                 onClick={() => setpageIndex(1)}>{i18n.t('Dashboard')}</button>
//                             <button className={pageindex === 3 ? 'buttonclicked' : 'buttonnavbar'}
//                                 onClick={() => setpageIndex(3)}>{i18n.t('Customers')}</button>
//                             <button className={pageindex === 4 ? 'buttonclicked' : 'buttonnavbar'}
//                                 onClick={() => setpageIndex(4)}>{i18n.t('Tips')}</button>
//                             <button className={pageindex === 5 ? 'buttonclicked' : 'buttonnavbar'}
//                                 onClick={() => setpageIndex(5)}>{i18n.t('Events')}</button>
//                             <button className={pageindex === 6 ? 'buttonclicked' : 'buttonnavbar'}
//                                 onClick={() => setpageIndex(6)}>{i18n.t('Astro')}</button>
//                             <button className={pageindex === 7 ? 'buttonclicked' : 'buttonnavbar'}
//                                 onClick={() => setpageIndex(7)}>{i18n.t('Dressing')}</button>
//                         </div>
//                     }

//                     <div>
//                         <button className='messagesbutton'><RiMessage2Line style={{ width: '25px', height: '25px' }} /></button>
//                         <button className='profilebutton' onClick={() => changeLanguage(i18n.language === 'en' ? 'fr' : 'en')}>
//                             <img style={{ borderRadius: '50%', width: '25px', height: '25px', objectFit: 'cover' }} src={flag} alt="flag" />
//                         </button>
//                         <button className='profilebutton'>{<CgProfile style={{ width: '25px', height: '25px' }} />}</button>
//                     </div>

//                 </header>
//             }
//         </div>
//     );
// };

function Header() {
    return (
        <div>
            <h1>Header</h1>
        </div>
    );
}

export default Header;