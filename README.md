# Convert Quickly (frontend) (formerly Media Convert)

**Convert Quickly** is a web application that allows users to upload media files, convert them to different formats, and download the converted files.

Check out [Convert Quickly (backend)](https://github.com/Temidayo32/media-convert-backend)

## Video Demo

[![Watch the video](https://img.youtube.com/vi/G3hXirKg_7s/maxresdefault.jpg)](https://youtu.be/G3hXirKg_7s)


```mermaid
flowchart TB
    subgraph Frontend["Frontend Application"]
        IDX["index.js
Entry Point"]
        
        subgraph Router["Dynamic Router"]
            ROUTES["Route Handler"]
            subgraph Pages["Pages"]
                VP["Video Pages
/video/*"]
                IP["Image Pages
/image/*"]
                AP["Auth Pages
/auth/*"]
            end
        end
        
        subgraph Context["React Context Layer"]
            AC[Auth Context]
            CC[Conversion Context]
        end
        
        subgraph Components["Reusable Components"]
            direction LR
            VC["Video Components"]
            IC["Image Components"]
            UC["UI Components"]
            AC2["Auth Components"]
        end
        
        subgraph MainThread["Main UI Thread"]
            COMP["UI Components"]
            AUTH["Authentication
Handler"]
            VCONV["Video Conversion
Handler"]
            ICONV["Image Operations
Handler"]
        end
        
        subgraph WebWorkers["Web Workers Thread"]
            IED["Image Editor
Worker"]
            direction TB
            subgraph Operations["Image Operations"]
                CROP["Crop/Resize"]
                FILTER["Filters"]
                EFFECTS["Effects"]
            end
        end
        
        subgraph ExternalServices["External Services"]
            FB[(Firebase
Auth)]
            BE[(Backend
API)]
        end
    end

    %% Core Application Flow
    IDX --> ROUTES
    ROUTES --> Pages
    
    %% Pages using Components
    VP --> VC
    IP --> IC
    AP --> AC2
    VP & IP & AP --> UC
    
    %% Main Thread Connections
    IDX --> Context
    Context --> MainThread
    AUTH <--> FB
    VCONV --> BE
    ICONV <--> IED
    
    %% Web Worker Connections
    IED --> Operations
    CROP & FILTER & EFFECTS --> ICONV
    
    %% Component Connections
    COMP --> AUTH
    COMP --> VCONV
    COMP --> ICONV
    
    %% Final Conversion Flow
    ICONV --> BE

    classDef primary fill:#2563eb,stroke:#1e40af,color:white
    classDef context fill:#7c3aed,stroke:#5b21b6,color:white
    classDef worker fill:#059669,stroke:#047857,color:white
    classDef external fill:#dc2626,stroke:#991b1b,color:white
    classDef router fill:#ea580c,stroke:#c2410c,color:white
    classDef components fill:#0d9488,stroke:#0f766e,color:white

    class IDX primary
    class AC,CC context
    class IED,CROP,FILTER,EFFECTS worker
    class FB,BE external
    class ROUTES,VP,IP,AP router
    class VC,IC,UC,AC2 components

```

## Frontend Architecture

ConvertQuickly's frontend is built with React, utilizing modern web technologies for efficient media processing. Here's how the system is organized:

1. **Routing Structure**:
   - Dynamic routing handles different sections of the application
   - Dedicated pages for video (/video/*), image (/image/*), and authentication (/auth/*)
   - Each route renders specific page components

2. **Component Organization**:
   - Reusable components grouped by functionality
   - Video components handle video-specific features
   - Image components manage image manipulation
   - Shared UI components for common elements
   - Auth components for user management

3. **Processing Distribution**:
   - **Main Thread**: Handles UI rendering, authentication, video, and images conversion requests
   - **Web Workers**: Manages real-time image editing operations
   - Backend communication for final conversion processing

4. **State Management**:
   - React Context API manages global state
   - Authentication state handled through Firebase
   - Conversion state tracks processing status

5. **Image Processing Pipeline**:
   - Real-time editing in web workers
   - Edited images sent back to main thread
   - Final conversion requests sent to backend API

The architecture emphasizes component reusability and clear separation of concerns, with each page utilizing specific components for its functionality while sharing common UI elements.


## Features

- **Upload Media Files**: Users can upload video, image and document files from their device, Dropbox, or Google Drive.
- **Editing Media Files**: Users can use a minimalistic image editor to edit images before conversion.
- **Convert Media Files**: The app supports converting videos, image and document files to various formats.
- **Download Converted Files**: Users can download the converted files to their device.

## Technologies Used

- **Frontend**:
  - React.js
  - Tailwind CSS
  - OpenCV (Image Editing)
  -

- **Backend**:
  - Node.js
  - Express.js
  - FFmpeg (for video conversion)
  - Jimp
  - Inkscape

- **Authentication**:
  - Firebase Authentication

- **Database and Cloud Storage**
  - AWS S3
  - Firestore

## Roadmap

- **Video Converter**: Support for converting video files (e.g., MP4, MPEG) .
- **Image Converter (In Development)**: Support for converting raster and vector image files (e.g., JPG, PNG, SVG).
- **Document Converter (Coming soon)**: Support for converting document files (e.g., PDF, DOCX).
