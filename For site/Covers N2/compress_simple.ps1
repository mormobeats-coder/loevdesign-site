Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem -Path "." -Filter "*.png" | Where-Object { $_.Name -notlike "*optimized*" }

foreach ($file in $files) {
    Write-Host "Сжимаю $($file.Name)..."
    
    $image = [System.Drawing.Image]::FromFile($file.FullName)
    
    # Сохраняем как JPEG с качеством 85%
    $image.Save("optimized\$($file.BaseName).jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
    
    $image.Dispose()
    Write-Host "Готово: $($file.BaseName).jpg"
}

Write-Host "Сжатие завершено!"


