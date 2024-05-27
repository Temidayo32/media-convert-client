import React from 'react';
import { FaVideo, FaFileImage, FaFileAlt, FaRocket, FaRegFilePdf } from 'react-icons/fa';
import { BsFiletypePng, BsFiletypeSvg, BsFiletypePdf, BsFiletypeDoc, BsFiletypeMp4, BsFiletypeGif } from "react-icons/bs";
import { useData } from '../../DataContext';

function HeroSection() {
    const { showSignUpOptions, setShowSignUpOptions } = useData();
    
    const toggleSignUpOptions = () => {
        setShowSignUpOptions(!showSignUpOptions);
    };

    return (
        <div className="mt-16 mb-24 flex items-center justify-between">
            <div className="w-1/2 px-20 mr-24">
                <h1 className="text-6xl font-bold text-teal-800 mb-4">Your #1 All-In-One Media Conversion Tool</h1>
                <p className="text-lg text-gray-600 mb-8">
                    Convert videos, images, and documents from one format to another with <strong class="text-teal-800">ease and speed!</strong>
                    </p>
                <button onClick={toggleSignUpOptions} className="bg-teal-800 hover:bg-teal-500 text-white py-4 px-8 text-xl rounded-xl transition-colors duration-300">
                    Get Started
                </button>
            </div>
            <div className="w-1/2 relative">
                <div className="relative">
                    <img src="/hero.svg" alt="Hero" className="w-4/6 hero-image" />
                    <div className="absolute transform -translate-x-1/2 -translate-y-1/2 hover:scale-110">
                        <FaRocket className="text-orange-300 text-3xl ml-12 mb-12 absolute bottom-96 left-80 icon-right" />
                        <FaVideo className="text-gray-300 text-3xl mx-28 absolute bottom-96 left-80 icon-right" />
                        <FaFileImage className="text-gray-300 text-4xl mx-32 absolute bottom-72 left-80 icon-right" />
                        <BsFiletypeDoc className="text-gray-300 text-3xl absolute bottom-96 right-16 icon-left"/>
                        <FaRegFilePdf className="text-orange-300 text-3xl absolute bottom-72 right-20 icon-left"/>
                        <BsFiletypePng className="text-gray-300 text-3xl absolute bottom-40 right-16 icon-left"/>
                        <BsFiletypeSvg className="text-gray-300 text-3xl absolute bottom-20 icon-left"/>
                        <BsFiletypeMp4 className="text-gray-300 text-3xl mx-4 absolute top-8 left-48 icon-bottom" />
                        <BsFiletypeGif className="text-gray-300 text-3xl mx-4 absolute top-6 left-24 icon-bottom"/>
                        <FaFileAlt className="text-orange-300 text-4xl mx-4 absolute left-96 icon-down" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HeroSection;
