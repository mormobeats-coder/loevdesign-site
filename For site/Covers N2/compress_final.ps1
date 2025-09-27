Add-Type -AssemblyName System.Drawing
 = Get-ChildItem -Path "." -Filter "*.png" | Where-Object { .Name -notlike "*optimized*" }
foreach ( in ) {
    Write-Host "Compressing ..."
     = [System.Drawing.Image]::FromFile(.FullName)
    .Save("optimized\.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
    .Dispose()
    Write-Host "Done: .jpg"
}
Write-Host "Compression completed!"
