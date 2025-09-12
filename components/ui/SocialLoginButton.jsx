"use client"
import { useState } from "react"
import { IconLoader2 } from "@tabler/icons-react";



const SocialLoginButton = ({ method, onClick }) => {

    const GoogleLogo = () => {
        return (
            <svg width="32" height="32" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M44.59 4.21a63.28 63.28 0 0 0 4.33 120.9a67.6 67.6 0 0 0 32.36.35a57.13 57.13 0 0 0 25.9-13.46a57.44 57.44 0 0 0 16-26.26a74.3 74.3 0 0 0 1.61-33.58H65.27v24.69h34.47a29.72 29.72 0 0 1-12.66 19.52a36.2 36.2 0 0 1-13.93 5.5a41.3 41.3 0 0 1-15.1 0A37.2 37.2 0 0 1 44 95.74a39.3 39.3 0 0 1-14.5-19.42a38.3 38.3 0 0 1 0-24.63a39.25 39.25 0 0 1 9.18-14.91A37.17 37.17 0 0 1 76.13 27a34.3 34.3 0 0 1 13.64 8q5.83-5.8 11.64-11.63c2-2.09 4.18-4.08 6.15-6.22A61.2 61.2 0 0 0 87.2 4.59a64 64 0 0 0-42.61-.38"/><path fill="#e33629" d="M44.59 4.21a64 64 0 0 1 42.61.37a61.2 61.2 0 0 1 20.35 12.62c-2 2.14-4.11 4.14-6.15 6.22Q95.58 29.23 89.77 35a34.3 34.3 0 0 0-13.64-8a37.17 37.17 0 0 0-37.46 9.74a39.25 39.25 0 0 0-9.18 14.91L8.76 35.6A63.53 63.53 0 0 1 44.59 4.21"/><path fill="#f8bd00" d="M3.26 51.5a63 63 0 0 1 5.5-15.9l20.73 16.09a38.3 38.3 0 0 0 0 24.63q-10.36 8-20.73 16.08a63.33 63.33 0 0 1-5.5-40.9"/><path fill="#587dbd" d="M65.27 52.15h59.52a74.3 74.3 0 0 1-1.61 33.58a57.44 57.44 0 0 1-16 26.26c-6.69-5.22-13.41-10.4-20.1-15.62a29.72 29.72 0 0 0 12.66-19.54H65.27c-.01-8.22 0-16.45 0-24.68"/><path fill="#319f43" d="M8.75 92.4q10.37-8 20.73-16.08A39.3 39.3 0 0 0 44 95.74a37.2 37.2 0 0 0 14.08 6.08a41.3 41.3 0 0 0 15.1 0a36.2 36.2 0 0 0 13.93-5.5c6.69 5.22 13.41 10.4 20.1 15.62a57.13 57.13 0 0 1-25.9 13.47a67.6 67.6 0 0 1-32.36-.35a63 63 0 0 1-23-11.59A63.7 63.7 0 0 1 8.75 92.4"/></svg>
        )
    }

    const MetaLogo = () => {
        return (
            <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M8.07 5.002c-1.595-.11-2.865.816-3.753 1.979c-.893 1.17-1.522 2.72-1.87 4.268c-.346 1.547-.433 3.189-.154 4.564c.272 1.336.964 2.71 2.42 3.145c1.389.415 2.635-.175 3.587-.976c.954-.802 1.78-1.946 2.446-3.051c.522-.867.968-1.75 1.318-2.504c.35.753.796 1.637 1.317 2.504c.666 1.105 1.492 2.249 2.446 3.051c.952.801 2.198 1.391 3.587.976c1.456-.435 2.148-1.809 2.42-3.145c.28-1.375.192-3.017-.154-4.564c-.348-1.548-.977-3.099-1.87-4.268c-.887-1.163-2.157-2.09-3.752-1.979c-1.734.12-2.97 1.469-3.687 2.488a11 11 0 0 0-.307.465a10 10 0 0 0-.308-.465c-.717-1.02-1.953-2.367-3.687-2.488Zm2.85 5.025c-.283.715-.97 2.348-1.888 3.873c-.621 1.032-1.313 1.958-2.02 2.552s-1.262.728-1.725.59c-.396-.118-.817-.56-1.034-1.627c-.208-1.027-.157-2.375.146-3.728c.304-1.353.838-2.614 1.508-3.493c.675-.885 1.369-1.242 2.024-1.196c.766.053 1.53.705 2.188 1.642c.368.523.643 1.052.8 1.386Zm2.288 0c.282.715.97 2.348 1.887 3.873c.622 1.032 1.314 1.958 2.02 2.552c.708.595 1.262.728 1.726.59c.395-.118.816-.56 1.033-1.627c.209-1.027.158-2.375-.146-3.728s-.837-2.614-1.508-3.493c-.675-.885-1.368-1.242-2.024-1.196c-.766.053-1.53.705-2.188 1.642a9.6 9.6 0 0 0-.8 1.386Z"/></g></svg>    
        )
    }

    const XLogo = () => {
        return (
            <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16.82 20.768L3.753 3.968A.6.6 0 0 1 4.227 3h2.48a.6.6 0 0 1 .473.232l13.067 16.8a.6.6 0 0 1-.474.968h-2.48a.6.6 0 0 1-.473-.232Z"/><path strokeLinecap="round" d="M20 3L4 21"/></g></svg>
        )
    }

    const methodList = {
        google : {
            logo : <GoogleLogo />,
            head : `Login as Google`,
            colorFore : "#000",
            colorBack : "#fff"
        },
        meta : {
            logo : <MetaLogo />,
            head : `Login as Meta`,
            colorFore : "#fff",
            colorBack : "#0064e0"
        },
        x : {
            logo : <XLogo />,
            head : `Login as X`,
            colorFore : "#fff",
            colorBack : "#000",
            border : false

        }
    }

    const [ isLoad, setIsLoad ] = useState(false);

    const onClickHandler = () => {
        setIsLoad(true);
        onClick();
    }

    return (
        <div className={`rounded-sm ${methodList[method].border && `border-1 border-white/15`} shadow-md hover:opacity-70 transition-opacity duration-300 cursor-pointer`}
             style={{
                background : methodList[method] ? methodList[method].colorBack : "white",
                color : methodList[method] ? methodList[method].colorFore : "black",
             }}
             onClick={onClickHandler}
        >
            <div className="flex flex-row gap-3 items-center p-3">
                {isLoad ? (
                    <div className="w-full h-full py-1 flex items-center justify-center">
                        <IconLoader2 className="animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="">
                            {methodList[method] ? methodList[method].logo : "n/a"}
                        </div>
                        <div className="">
                            {methodList[method] ? methodList[method].head : "n/a"}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
export default SocialLoginButton;