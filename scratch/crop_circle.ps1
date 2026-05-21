Add-Type -AssemblyName System.Drawing

function Crop-ImageToCircle {
    param(
        [string]$srcPath,
        [string]$destPath
    )
    
    $bmpSrc = [System.Drawing.Image]::FromFile($srcPath)
    $width = $bmpSrc.Width
    $height = $bmpSrc.Height
    $size = [Math]::Min($width, $height)

    # Create destination bitmap with transparent background
    $bmpDest = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmpDest)
    
    # Enable high-quality anti-aliasing
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    # Clip drawing area to a perfect circle
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(0, 0, $size, $size)
    $g.SetClip($path)

    # Calculate coordinates to center-crop the source image
    $xOffset = ($width - $size) / 2
    $yOffset = ($height - $size) / 2
    $rect = New-Object System.Drawing.RectangleF(-$xOffset, -$yOffset, $width, $height)
    
    # Draw cropped image
    $g.DrawImage($bmpSrc, $rect)

    # Save to file as PNG (maintains transparency)
    $bmpDest.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)

    # Dispose resources
    $g.Dispose()
    $bmpDest.Dispose()
    $bmpSrc.Dispose()
}

$officialPath = "e:\A2soluntions\projetos\a2mentor\public\logo oficial.png"

$destinations = @(
    "e:\A2soluntions\projetos\a2mentor\public\logo.png",
    "e:\A2soluntions\projetos\a2mentor\public\icon.png",
    "e:\A2soluntions\projetos\a2mentor\public\favicon.png",
    "e:\A2soluntions\projetos\a2mentor\public\pwa-192x192.png",
    "e:\A2soluntions\projetos\a2mentor\public\pwa-512x512.png",
    "e:\A2soluntions\projetos\a2mentor\public\apple-touch-icon.png",
    "e:\A2soluntions\projetos\a2mentor\src\assets\logo-a2.png",
    "e:\A2soluntions\projetos\a2mentor\src\assets\logo.png"
)

foreach ($dest in $destinations) {
    Write-Host "Cropping and saving circular logo to $dest..."
    Crop-ImageToCircle -srcPath $officialPath -destPath $dest
}

Write-Host "All icons cropped to circle successfully!"
