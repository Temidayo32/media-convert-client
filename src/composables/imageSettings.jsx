import { Tooltip, Slider, Select, MenuItem, InputLabel, FormControl, Checkbox, FormControlLabel } from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import FlipIcon from '@mui/icons-material/Flip';

export const renderSettingControl = (category, setting, imageSettings, selectedPreset, setSelectedPreset, handleApplyCrop, handleSettingChange, handleFlip, handleRotateClick) => {
    if (!setting) return null;

    switch (setting.type) {
      case 'range':
        return (
          <div className="flex items-center">
            <InputLabel className="mr-2 text-xs"  
            sx={{
              marginRight: '0.5rem',
              color: 'white',
              whiteSpace: 'nowrap',
              overflow: 'visible',
            }}
            >
              {setting.label}
            </InputLabel>
            <Slider
              value={imageSettings[category][setting.key]}
              min={setting.min}
              max={setting.max}
              step={setting.step}
              valueLabelDisplay="auto"
              onChange={(e, newValue) =>
                handleSettingChange(category, setting.key, newValue)
              }
              className="flex-grow"
              sx={{ color: 'white' }}
            />
          </div>
        );
      case 'select':
        return (
          <FormControl fullWidth>
            <InputLabel 
              sx={{
                marginRight: '0.5rem',
                color: 'white',
                whiteSpace: 'nowrap',
                overflow: 'visible',
              }}>
              {setting.label}
            </InputLabel>
            <Select
              value={imageSettings[category][setting.key]}
              onChange={(e) =>
                handleSettingChange(category, setting.key, e.target.value)
              }
              sx={{ color: 'white' }}
            >
              {setting.options.map(option => (
                <MenuItem key={option.value} value={option.value} >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'number':
        return (
          <div className="flex items-center">
            <InputLabel className="mr-2" sx={{
              marginRight: '0.5rem',
              color: 'white',
              whiteSpace: 'nowrap',
              overflow: 'visible',
            }}>{setting.label}</InputLabel>
            <input
              type="number"
              value={imageSettings[category][setting.key]}
              min={setting.min}
              max={setting.max}
              step={setting.step}
              onChange={(e) =>
                handleSettingChange(category, setting.key, parseInt(e.target.value))
              }
              className="border border-gray-300 p-1 rounded w-full"
            />
          </div>
        );
      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={imageSettings[category][setting.key]}
                onChange={(e) =>
                  handleSettingChange(category, setting.key, e.target.checked)
                }
              />
            }
            sx={{
              marginRight: '0.5rem',
              color: 'white',
              whiteSpace: 'nowrap',
              overflow: 'visible',
            }}
            label={setting.label}
          />
        );
      case 'preset':
          return (
            <div className="mt-4">
              <div className="mt-1 grid grid-cols-2 gap-4">
                {setting.presets.map((preset, index) => (
                 <div key={`${preset.label}-${index}`} className="flex items-center justify-center p-2"> 
                  <button
                      onClick={() => setSelectedPreset(preset.label === 'None' ? null : preset)}
                      className="flex flex-col items-center justify-center p-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      style={{ width: `${preset.width/ 5}px`, height: `${preset.height/5}px` }}
                    >
                      <div className="text-sm text-gray-500">{preset.label}</div>
                    </button>
                  </div>
                ))}
                {selectedPreset && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={handleApplyCrop}
                      className="px-4 py-2 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Apply Crop
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
      case 'icon':
        if (setting.key === 'angle') {
          return (
            <div className="flex items-center pl-4 gap-4">
              <div onClick={() => handleRotateClick(setting.options[1].value)} className="mr-2 flex items-center cursor-pointer text-white">
                <InputLabel className="mr-2" sx={{
                  marginRight: '0.5rem',
                  // fontSize: '0.75rem',
                  color: 'white',
                  whiteSpace: 'nowrap',
                  overflow: 'visible',
                }}>Left</InputLabel>
                <RotateLeftIcon className="transform transition-transform duration-300 hover:scale-110" />
              </div>
              <div onClick={() => handleRotateClick(setting.options[2].value)} className="mr-2 flex items-center cursor-pointer text-white">
                <InputLabel className="mr-2"
                  sx={{
                  marginRight: '0.5rem',
                  // fontSize: '0.75rem',
                  color: 'white',
                  whiteSpace: 'nowrap',
                  overflow: 'visible',
                }}>Right</InputLabel>
                <RotateRightIcon className="transform transition-transform duration-300 hover:scale-110" />
              </div>
            </div>
          );
        }
      case 'flip':
        if (setting.key === 'horizontal') {
          return (
            <div className="flex flex-col justify-between mb-4 text-white">
              <div className="flex items-center mb-2 cursor-pointer hover:bg-gray-400 p-2 rounded-lg" onClick={() => handleFlip('horizontal')}>
                <FlipIcon sx={{ transform: imageSettings.flip.horizontal ? 'scaleX(-1)' : 'scaleX(1)' }} />
                <InputLabel className="ml-2"  sx={{ marginLeft: '1.75rem', color: 'white' }}>Flip Horizontal</InputLabel>
              </div>
              <div className="flex items-center cursor-pointer hover:bg-gray-400 p-2 rounded-lg" onClick={() => handleFlip('vertical')}>
                <FlipIcon sx={{
                  transform: `rotate(90deg) ${imageSettings.flip.vertical ? 'scaleX(-1)' : 'scaleX(1)'}`,
                }} />
                <InputLabel className="ml-2" sx={{ marginLeft: '1.75rem', color: 'white' }}>Flip Vertical</InputLabel>
              </div>
            </div>
          )
        };
       break;
      default:
        return null;
    }
  };