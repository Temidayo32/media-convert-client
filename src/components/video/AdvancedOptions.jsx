import React, {useState} from 'react'

import { BsGearFill } from 'react-icons/bs';
import { AiOutlineClose } from 'react-icons/ai';

import { Tooltip, Select, MenuItem, FormControl, InputLabel, TextField, Checkbox, FormControlLabel, Slider, Icon, IconButton } from '@mui/material';


const videoCodecs = [
    { value: 'libx264', label: 'H.264', description: 'Good balance between compression and quality' },
    { value: 'libx265', label: 'H.265', description: 'Offers better compression efficiency compared to H.264' },
    { value: 'libvpx-vp9', label: 'VP9', description: 'Good for web videos' },
    { value: 'libaom-av1', label: 'AV1', description: 'Next-generation codec with better compression efficiency' },
    { value: 'libxvid', label: 'MPEG-4', description: 'Older codec, good quality at lower bitrates' },
    { value: 'prores_ks', label: 'ProRes', description: 'High-quality, good for professional video editing' },
    { value: 'dnxhd', label: 'DNxHD', description: 'High-quality editing workflows' },
    { value: 'dnxhr', label: 'DNxHR', description: 'High-quality editing workflows' },
    { value: 'huffyuv', label: 'HuffYUV', description: 'Lossless, good for intermediate video processing' },
    { value: 'ffv1', label: 'FFV1', description: 'Lossless, efficient for archiving purposes' },
  ];

const frameRates = [
    { value: '23.976', label: '23.976 FPS', description: 'Commonly used frame rate in film production' },
    { value: '24', label: '24 FPS', description: 'Standard frame rate used in film production worldwide.' },
    { value: '25', label: '25 FPS', description: 'Standard frame rate used in PAL video systems, primarily in European countries.' },
    { value: '29.97', label: '29.97 FPS', description: 'Standard frame rate used in NTSC video systems, primarily in North America.' },
    { value: '30', label: '30 FPS', description: 'Roundup of NTSC frame rate, commonly used in digital video production.' },
    { value: '50', label: '50 FPS', description: 'High frame rate suitable for smooth motion and high-quality playback.' },
    { value: '59.94', label: '59.94 FPS', description: 'NTSC-compatible high frame rate often used for high-quality video production.' },
    { value: '60', label: '60 FPS', description: 'High frame rate providing smooth motion and enhanced visual quality.' },
    { value: '120', label: '120 FPS', description: 'Extremely high frame rate suitable for ultra-smooth slow-motion playback.' },
    { value: '240', label: '240 FPS', description: 'Very high frame rate enabling super slow-motion effects with exceptional detail.' },
  ];

const resolutions = [
    { value: '1920x1080', label: '1080p (1920x1080)' },
    { value: '1280x720', label: '720p (1280x720)' },
    { value: '854x480', label: '480p (854x480)' },
    { value: '640x360', label: '360p (640x360)' },
    { value: '426x240', label: '240p (426x240)' },
    { value: '256x144', label: '144p (256x144)' },
  ];

const cropFilters = [
    { value: '640:480:100:100', label: '640x480 from (100,100)'},
    { value: '1280:720:0:0', label: '1280x720 (Top Left)' },
    { value: '800:600:50:50', label: '800x600 from (50,50)'},
    { value: '1920:1080:200:200', label: '1920x1080 from (200,200)' },
    { value: '1024:768:100:50', label: '1024x768 from (100,50)' },
    { value: '720:480:10:10', label: '720x480 from (10,10)' },
    { value: '640:360:30:30', label: '640x360 from (30,30)' },
    { value: '320:240:0:0', label: '320x240 (Top Left)' },
    { value: '480:320:40:40', label: '480x320 from (40,40)' },
    { value: '1600:900:100:100', label: '1600x900 from (100,100)' },
  ];

const rotateFilters = [
    { value: 'PI/2', label: '90 Degrees' },
    { value: 'PI', label: '180 Degrees' },
    { value: '3*PI/2', label: '270 Degrees' },
    { value: '-PI/2', label: '-90 Degrees' },
  ];

const audioCodecs = [
    { label: 'AAC', value: 'aac', description: 'High-quality compression for streaming and online media.' },
    { label: 'MP3', value: 'mp3', description: 'Widely-used format for music and general playback.' },
    { label: 'Opus', value: 'opus', description: 'Versatile codec with excellent compression and quality.' },
    { label: 'FLAC', value: 'flac', description: 'Lossless compression for preservation and high fidelity.' },
    { label: 'Vorbis', value: 'vorbis', description: 'Open and efficient codec for web streaming.' },
    { label: 'PCM', value: 'pcm', description: 'Uncompressed audio with original waveform preservation.' },
    { label: 'WAV', value: 'wav', description: 'Standard uncompressed format for professional use.' }
  ];
  

function AdvancedOptions({ onClose, formData, onChange, resetData, fileName, fileSize }) {

    const handleClick = (e) => {
        if (e.target.id === 'closeOptions') {
          onClose();
        }
      };

    const handleFieldChange = (field, value) => {
        onChange({
          ...formData,
          [field]: value,
        });
    };
    
    const handleCropFilterChange = (event) => {
      handleFieldChange('selectedCropFilter', event.target.value);
    };
    
    const handleRotateFilterChange = (event) => {
      handleFieldChange('selectedRotateFilter', event.target.value);
    };

    const handleDenoiseChange = (event) => {
      handleFieldChange('selectedDenoise', event.target.value);
    };
    
    const handleDeshakeChange = (event) => {
      handleFieldChange('deshakeChecked', event.target.value);
    };

    const handleNoAudio = (event) => {
      handleFieldChange('noAudio', event.target.value);
    }

    const handleAspectRatioChange = (event) => {
      handleFieldChange('selectedAspectRatio', event.target.value);
    };
    
    const handleVolumeChange = (event, newValue) => {
      onChange({
        ...formData,
        volume: newValue,
      });
    };
    
    const handleScaleChange = (event) => {
      const { name, value } = event.target;
      onChange({
        ...formData,
        selectedScale: {
          ...formData.selectedScale,
          [name]: value,
        },
      });
  };

  const handleResolutionChange = (field) => (event) => {
    const value = event.target.value;
    onChange ({
      ...formData,
      [field]: value,
    });
  };

      return (
        <div>
          <div
            id='closeOptions'
            className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-20"
            onClick={handleClick}
          >
                <div className="bg-white p-8 h-5/6 w-4/5 shadow-xl rounded">
                    <div className="flex items-center mb-2">
                        <div className=" w-11/12 flex flex-col">
                            <div className='flex items-center mb-2 gap-4 justify-start relative'>
                                <BsGearFill className="text-3xl text-gray-600" />
                                <h2 className="text-3xl font-semibold">Advanced Options (Optional)</h2>
                            </div>
                            <p className='text-gray-500'>File name: {fileName} ({fileSize}) </p>
                        </div>
                        <div className='w-1/12 flex justify-end'>
                            <AiOutlineClose
                            id="closeIcon"
                            className="text-2xl cursor-pointer hover:text-red-600 transform hover:scale-110 transition transition-colors duration-300"
                            onClick={() => onClose()}
                            />
                        </div>
                    </div>
                    {/* Video Options Section */}
                    <div className='rounded h-4/5 overflow-y-scroll'>
                        <div className="bg-gray-300 p-6">
                            <h3 className="text-xl font-semibold">Video Options</h3>
                        </div>
                        <div className="bg-gray-100 px-12 py-8">
                            {/* Add your video option fields here */}
                            <div className='flex mb-4'>
                                <h4 className="mb-2 font-semibold w-1/6">Video Codec</h4>
                                <div className="grid grid-cols-5 gap-4 w-5/6">
                                    {videoCodecs.map((codec) => (
                                    <Tooltip key={codec.value} title={codec.description} arrow placement="top">
                                        <div
                                        className={`p-2 border rounded cursor-pointer duration-300 transform hover:scale-105 text-center ${formData.selectedCodec === codec.value ? 'bg-teal-500 text-white' : 'bg-white hover:bg-gray-300'}`}
                                        onClick={() =>  handleFieldChange('selectedCodec', codec.value)}
                                        >
                                        {codec.label}
                                        </div>
                                    </Tooltip>
                                    ))}
                                </div>
                            </div>
                            <div className='flex mb-4'>
                                <h4 className="mb-2 font-semibold w-1/6">Frame Rate</h4>
                                <div className="grid grid-cols-5 gap-4 w-5/6">
                                    {frameRates.map((rate) => (
                                    <Tooltip key={rate.value} title={rate.description} arrow placement="top">
                                        <div
                                        className={`p-2 border rounded cursor-pointer duration-300 transform hover:scale-105 text-center ${formData.selectedFrameRate === rate.value ? 'bg-teal-500 text-white' : 'bg-white hover:bg-gray-300'}`}
                                        onClick={() => handleFieldChange('selectedFrameRate', rate.value)}
                                        >
                                        {rate.label}
                                        </div>
                                    </Tooltip>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center mb-4">
                                <h4 className="mb-2 font-semibold w-1/6">Aspect Ratio</h4>
                                <Select
                                value={formData.selectedAspectRatio}
                                onChange={handleAspectRatioChange}
                                displayEmpty
                                className='w-5/6'
                                inputProps={{ 'aria-label': 'Without label' }}
                                >
                                <MenuItem value="">None</MenuItem>
                                <MenuItem value="16:9">16:9 (Widescreen)</MenuItem>
                                <MenuItem value="4:3">4:3 (Standard)</MenuItem>
                                <MenuItem value="1:1">1:1 (Square)</MenuItem>
                                <MenuItem value="21:9">21:9 (Cinematic)</MenuItem>
                                <MenuItem value="9:16">9:16 (Vertical)</MenuItem>
                                </Select>
                            </div>
                            <div className='flex'>
                                {/* Resolution Section */}
                                <h4 className="mb-2 font-semibold w-1/6">Resolution</h4>
                                <div className='w-5/6'>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel>Resolution</InputLabel>
                                        <Select
                                        value={formData.selectedResolution}
                                        onChange={handleResolutionChange('selectedResolution')}
                                        label="Resolution"
                                        >
                                         <MenuItem value="">None</MenuItem>
                                         {resolutions.map((resolution) => (
                                            <MenuItem key={resolution.value} value={resolution.value}>
                                            {resolution.label}
                                            </MenuItem>
                                        ))}
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <div className='flex mb-4'>
                                {/* Scale Filter Section */}
                                <h4 className="mb-2 font-semibold w-1/6">Custom Resolution</h4>
                                <div className="w-5/6">
                                    <div className="flex w-full gap-4">
                                        <TextField
                                        fullWidth
                                        label="Width"
                                        name="width"
                                        value={formData.selectedScale.width}
                                        onChange={handleScaleChange}
                                        variant="outlined"
                                        margin="normal"
                                        />
                                        <TextField
                                        fullWidth
                                        label="Height"
                                        name="height"
                                        value={formData.selectedScale.height}
                                        onChange={handleScaleChange}
                                        variant="outlined"
                                        margin="normal"
                                        />
                                    </div>
                                    <p className='text-gray-500 text-right'>Resize the video</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 mb-4">
                            <div className="flex">
                                <h4 className="mb-2 font-semibold w-1/6">Crop Video</h4>
                                <div className='w-5/6'>
                                    <FormControl variant="outlined" fullWidth>
                                        <InputLabel>Crop Filter</InputLabel>
                                        <Select
                                            value={formData.selectedCropFilter}
                                            onChange={handleCropFilterChange}
                                            label="Crop Filter"
                                        >
                                             <MenuItem value="">None</MenuItem>
                                             {cropFilters.map((filter) => (
                                                <MenuItem key={filter.value} value={filter.value}>
                                                    {filter.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <div className="col-span-1 flex flex-col justify-end">
                                <p className="text-gray-500 text-right mt-1">Crop the video</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 mb-4">
                            <div className='flex'>
                                <h4 className="mb-2 font-semibold w-1/6">Rotate Video</h4>
                                <div className='w-5/6'>
                                    <FormControl variant="outlined" fullWidth>
                                    <InputLabel>Rotate Filter</InputLabel>
                                    <Select
                                        value={formData.selectedRotateFilter}
                                        onChange={handleRotateFilterChange}
                                        label="Rotate Filter"
                                    >
                                         <MenuItem value="">None</MenuItem>
                                         {rotateFilters.map((filter) => (
                                        <MenuItem key={filter.value} value={filter.value}>
                                            {filter.label}
                                        </MenuItem>
                                        ))}
                                    </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <div className="col-span-1 flex flex-col justify-end">
                                <p className="text-gray-500 text-right mt-1">Rotate the video</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 mb-4">
                            <div className="flex">
                                <h4 className="mb-2 font-semibold w-1/6">Denoise Video</h4>
                                <div className="w-5/6">
                                <FormControl variant="outlined" fullWidth>
                                <InputLabel id="denoise-label">Denoise Filter</InputLabel>
                                <Select
                                    labelId="denoise-label"
                                    id="denoise"
                                    value={formData.selectedDenoise}
                                    onChange={handleDenoiseChange}
                                    label="Denoise Filter" // Add label prop here
                                >
                                    <MenuItem value="">None</MenuItem>
                                    <MenuItem value="hqdn3d=1.5:1.5:6.0:6.0">Light</MenuItem>
                                    <MenuItem value="hqdn3d=3:3:12:12">Moderate</MenuItem>
                                    <MenuItem value="hqdn3d=6:6:24:24">Strong</MenuItem>
                                </Select>
                                </FormControl>
                                </div>
                            </div>
                            <div className="col-span-1 flex flex-col justify-end">
                                <p className="text-gray-500 text-right mt-1">Reduce video noise</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 mb-4">
                            <div className="flex items-center">
                                <h4 className="font-semibold w-1/6">Deshake Video</h4>
                                <div className='w-5/6'>
                                    <FormControlLabel
                                        control={<Checkbox checked={formData.deshakeChecked} onChange={handleDeshakeChange} />}
                                        label=""
                                    />
                                </div>
                            </div>
                        </div>
                        



                        </div>
                        <div className="bg-gray-300 p-6">
                            <h3 className="text-xl font-semibold">Audio Options</h3>
                        </div>
                        <div className="bg-gray-100 px-12 py-8">
                            <div className='flex mb-4'>
                            <h4 className="mb-2 font-semibold w-1/6">Audio Codec</h4>
                                <div className="grid grid-cols-5 gap-4 w-5/6">
                                    {audioCodecs.map((codec) => (
                                        <Tooltip key={codec.value} title={codec.description} arrow placement="top">
                                            <div
                                            className={`p-2 border rounded cursor-pointer duration-300 transform hover:scale-105 text-center ${formData.selectedAudioCodec === codec.value ? 'bg-teal-500 text-white' : 'bg-white hover:bg-gray-300'}`}
                                            onClick={() => handleFieldChange('selectedAudioCodec', codec.value)}
                                            >
                                            {codec.label}
                                            </div>
                                        </Tooltip>
                                        ))}
                                </div>
                                    
                            </div>
                            <div className="flex mb-4">
                                <h4 className='mb-2 font-semibold w-1/6'> Volume</h4> 
                                <Slider
                                    value={formData.volume}
                                    onChange={handleVolumeChange}
                                    aria-labelledby="volume-slider"
                                    valueLabelDisplay="auto"
                                    min={0}
                                    max={3}
                                    step={0.1}
                                />
                              </div>
                              <div className="grid grid-cols-1 mb-4">
                                  <div className="flex items-center">
                                      <h4 className="font-semibold w-1/6">No Audio</h4>
                                      <div className='w-5/6'>
                                          <FormControlLabel
                                              control={<Checkbox checked={formData.noAudio} onChange={handleNoAudio} />}
                                              label=""
                                          />
                                      </div>
                                  </div>
                              </div>

                        </div>
                    </div>
                    <div className='flex items-end'>
                      <Tooltip title="Reset All Options to Default Settings" arrow placement="top">
                          <button onClick={() => resetData()} className='text-lg text-gray-500 mt-2 border border-2 p-2 rounded hover:bg-gray-300'>
                            Reset Options
                          </button>
                      </Tooltip>
                    </div>
              {/* Content goes here */}
            </div>
          </div>
        </div>
      );
}

export default AdvancedOptions
