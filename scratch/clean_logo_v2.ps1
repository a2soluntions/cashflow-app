Add-Type -AssemblyName System.Drawing

function Clean-Logo-Advanced($imgPath, $savePath) {
    Write-Host "Advanced Processing $imgPath ..."
    $bmp = [System.Drawing.Bitmap]::FromFile($imgPath)
    $width = $bmp.Width
    $height = $bmp.Height
    
    $newBmp = New-Object System.Drawing.Bitmap($width, $height)
    $newBmp.SetResolution($bmp.HorizontalResolution, $bmp.VerticalResolution)
    
    # We'll use a simple threshold to detect checkerboard
    # AI checkerboards are usually #FFFFFF and #CBCBCB or similar
    
    for ($x = 0; $x -lt $width; $x++) {
        for ($y = 0; $y -lt $height; $y++) {
            $pixel = $bmp.GetPixel($x, $y)
            
            $isWhite = ($pixel.R -gt 240 -and $pixel.G -gt 240 -and $pixel.B -gt 240)
            $isGray = ([Math]::Abs($pixel.R - $pixel.G) -lt 5 -and [Math]::Abs($pixel.G - $pixel.B) -lt 5 -and $pixel.R -gt 180 -and $pixel.R -lt 220)
            
            # If it's in the corners or edges and matches background colors, make it transparent
            # Also use a circular mask for safety
            $centerX = $width / 2
            $centerY = $height / 2
            $dx = $x - $centerX
            $dy = $y - $centerY
            $dist = [Math]::Sqrt($dx*$dx + $dy*$dy)
            
            # The metallic ring seems to end around 90-95% of the radius
            $maxRadius = ([Math]::Min($width, $height) / 2) * 0.96
            
            if ($dist -gt $maxRadius) {
                $newBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } elseif (($isWhite -or $isGray) -and $dist -gt ($maxRadius * 0.8)) {
                # If it's background color and near the edge, make it transparent
                # This helps with the "glow" area that might have checkerboard bleed
                $newBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } else {
                $newBmp.SetPixel($x, $y, $pixel)
            }
        }
    }

    $newBmp.Save($savePath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $newBmp.Dispose()
}

$publicDir = "E:\A2soluntions\projetos\VittaCash\public"
$icons = @("logo.png", "favicon.png", "icon.png", "apple-touch-icon.png", "pwa-192x192.png", "pwa-512x512 .png")

foreach ($icon in $icons) {
    $path = Join-Path $publicDir $icon
    if (Test-Path $path) {
        $tempPath = Join-Path $publicDir ("temp_" + $icon)
        Clean-Logo-Advanced $path $tempPath
        Remove-Item $path
        Move-Item $tempPath $path
    }
}
