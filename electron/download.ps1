# download_model.ps1
$MODEL_DIR = "$PSScriptRoot\backend\phi-3"
New-Item -ItemType Directory -Force -Path $MODEL_DIR

$FILES = @(
    "config.json",
    "tokenizer.json",
    "model.onnx",
    "tokenizer_config.json"
)

$BASE_URL = "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-onnx/resolve/main"

foreach ($file in $FILES) {
    $output = "$MODEL_DIR\$file"
    $url = "$BASE_URL/$file"
    
    # Write progress to stdout (for Electron to capture)
    Write-Output "Downloading $file..."
    
    # Download with progress (using ProgressPreference)
    $ProgressPreference = 'SilentlyContinue'  # Suppress native PS progress bar
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
        Write-Output "✓ Downloaded $file"
    } catch {
        Write-Output "✗ Failed to download $file: $_"
        exit 1
    }
}

Write-Output " All files downloaded to $MODEL_DIR"