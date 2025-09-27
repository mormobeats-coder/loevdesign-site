 = @('404.html', 'blog-classification.html', 'blog-papa-brenda.html', 'blog-post.html', 'blog.html', 'case-rockot.html', 'case.html', 'page-template.html', 'privacy.html', 'showreel.html')
foreach ( in ) {
    if (Test-Path ) {
        Write-Host "Updating ..."
        (Get-Content ) -replace '104072618', '104304944' | Set-Content 
        Write-Host "Done: "
    }
}
Write-Host "All files updated!"
