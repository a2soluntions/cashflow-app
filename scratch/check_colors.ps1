Add-Type -AssemblyName System.Drawing
$imgPath = "E:\A2soluntions\projetos\VittaCash\public\logo.png"
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

# Check a few sample pixels from the corners to find checkerboard colors
$c1 = $bmp.GetPixel(0, 0)
$c2 = $bmp.GetPixel(0, 10) # Likely different if checkerboard
$c3 = $bmp.GetPixel(10, 0)

Write-Host "C1: $($c1.R),$($c1.G),$($c1.B) A:$($c1.A)"
Write-Host "C2: $($c2.R),$($c2.G),$($c2.B) A:$($c2.A)"
Write-Host "C3: $($c3.R),$($c3.G),$($c3.B) A:$($c3.A)"

$bmp.Dispose()
