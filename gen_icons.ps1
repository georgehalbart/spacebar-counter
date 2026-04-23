Add-Type -AssemblyName System.Drawing

function Create-Icon {
    param(
        [int]$Size,
        [string]$Path
    )
    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    # Draw background
    $rect = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 49, 130, 206)) # Accent blue
    $g.FillEllipse($brush, $rect)

    # Draw text
    $fontSize = $Size * 0.4
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $rectF = New-Object System.Drawing.RectangleF(0, 0, $Size, $Size)
    $g.DrawString("SB", $font, $textBrush, $rectF, $format)

    $g.Dispose()
    $brush.Dispose()
    $font.Dispose()
    $textBrush.Dispose()
    $format.Dispose()

    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

$sizes = @(16, 32, 48, 128)
foreach ($size in $sizes) {
    Create-Icon -Size $size -Path "c:\laragon\www\Saas\spacebar-extension\icons\icon$size.png"
}
Write-Host "Icons generated successfully."
