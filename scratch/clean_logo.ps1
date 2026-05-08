Add-Type -AssemblyName System.Drawing

function Clean-Logo($imgPath, $savePath) {
    Write-Host "Processing $imgPath ..."
    $bmp = [System.Drawing.Bitmap]::FromFile($imgPath)
    $width = $bmp.Width
    $height = $bmp.Height
    $centerX = $width / 2
    $centerY = $height / 2
    $radius = [Math]::Min($centerX, $centerY) - 1

    $newBmp = New-Object System.Drawing.Bitmap($width, $height)
    # Ensure ARGB format for transparency
    $newBmp.SetResolution($bmp.HorizontalResolution, $bmp.VerticalResolution)

    for ($x = 0; $x -lt $width; $x++) {
        for ($y = 0; $y -lt $height; $y++) {
            $dx = $x - $centerX
            $dy = $y - $centerY
            if ([Math]::Sqrt($dx*$dx + $dy*$dy) -le $radius) {
                $pixel = $bmp.GetPixel($x, $y)
                # If the pixel is part of the "checkerboard" (which we don't want inside either if it's there), 
                # but usually inside the circle is the real logo.
                $newBmp.SetPixel($x, $y, $pixel)
            } else {
                $newBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
        }
    }

    $newBmp.Save($savePath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $newBmp.Dispose()
    Write-Host "Saved to $savePath"
}

$publicDir = "E:\A2soluntions\projetos\VittaCash\public"
$icons = @("logo.png", "favicon.png", "icon.png", "apple-touch-icon.png", "pwa-192x192.png", "pwa-512x512 .png")

foreach ($icon in $icons) {
    $path = Join-Path $publicDir $icon
    if (Test-Path $path) {
        $tempPath = Join-Path $publicDir ("temp_" + $icon)
        Clean-Logo $path $tempPath
        # Move back to original name
        Remove-Item $path
        Move-Item $tempPath $path
    }
}

