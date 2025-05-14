# Assets Directory

This directory contains all media files used in the project.

## Structure

- `/images` - Static images used in the application
- `/videos` - Video files used in the application

## Video Background

The main background video (`videoBG.mp4`) should be placed in the `/videos` directory. This video should be:
- High quality but optimized for web (compressed)
- Ideally 1080p or higher resolution
- In MP4 format for best browser compatibility
- Short in duration (10-30 seconds) and designed to loop seamlessly

## Adding New Media Files

1. Place all image files in the `/images` directory
2. Place all video files in the `/videos` directory
3. Import the files in your components using:
   ```javascript
   // For images
   import myImage from '../assets/images/myImage.png';
   
   // For videos
   import myVideo from '../assets/videos/myVideo.mp4';
   ```

## Media Attribution

Make sure to comply with licensing requirements for any media used in the project. 