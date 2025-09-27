Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem -Path "." -Filter "*.png" | Where-Object { $_.Name -notlike "*optimized*" }

foreach ($file in $files) {
    Write-Host "Сжимаю $($file.Name)..."
    
    $image = [System.Drawing.Image]::FromFile($file.FullName)
    
    # Получаем кодек для JPEG
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetEncoders() | Where-Object { $_.FormatID -eq [System.Drawing.Imaging.ImageFormat]::Jpeg.Guid }
    
    # Настройки качества (85%)
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 85L)
    
    # Сохраняем как JPEG
    $image.Save("optimized\$($file.BaseName).jpg", $codec, $encoderParams)
    
    $image.Dispose()
    Write-Host "Готово: $($file.BaseName).jpg"
}

Write-Host "Сжатие завершено!"