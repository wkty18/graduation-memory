# Compress and generate thumbnails for archive images (ASCII only, run: powershell -ExecutionPolicy Bypass -File compress-images.ps1)
Add-Type -AssemblyName System.Drawing
$dir = Join-Path $PSScriptRoot 'assets\archive\graduation-2026'
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }

function Save-Jpeg($bmp, $path, $quality) {
  $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)
  $bmp.Save($path, $jpegCodec, $ep)
  $ep.Dispose()
}

Get-ChildItem -Path $dir -Include *.jpg, *.jpeg -Recurse | ForEach-Object {
  $src = $_.FullName
  $img = [System.Drawing.Image]::FromFile($src)

  # Thumbnail: max width 640, quality 70
  $tw = 640
  if ($img.Width -gt $tw) {
    $th = [int]($img.Height * $tw / $img.Width)
    $bmp = New-Object System.Drawing.Bitmap($tw, $th)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($img, 0, 0, $tw, $th)
    $out = Join-Path $_.DirectoryName ($_.BaseName + '_thumb.jpg')
    Save-Jpeg $bmp $out 70
    $g.Dispose(); $bmp.Dispose()
    Write-Output ("thumb: " + $_.Name)
  }

  # Recompress large originals in place (max width 1920, quality 78)
  if ($img.Width -gt 1920 -or $_.Length -gt 1572864) {
    $w = $img.Width; $h = $img.Height
    if ($w -gt 1920) { $h = [int]($h * 1920 / $w); $w = 1920 }
    $bmp2 = New-Object System.Drawing.Bitmap($w, $h)
    $g2 = [System.Drawing.Graphics]::FromImage($bmp2)
    $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g2.DrawImage($img, 0, 0, $w, $h)
    $img.Dispose()
    Save-Jpeg $bmp2 $src 78
    $g2.Dispose(); $bmp2.Dispose()
    Write-Output ("compress: " + $_.Name)
  } else {
    $img.Dispose()
  }
}
Write-Output 'DONE'
