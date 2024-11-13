# 设置错误动作首选项
$ErrorActionPreference = "Stop"
# 设置控制台输出编码为 UTF-8
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8


function Deploy-Action {
  try {
    # 运行 yarn lint
    Write-Host "运行 yarn lint..."
    yarn lint

    # 检查 yarn lint 是否成功
    if ($LASTEXITCODE -ne 0) {
      Write-Host "代码检查不通过" -ForegroundColor Red
      return;
    }
    Write-Host "代码检查通过"
    Deploy-Start "https://registry.npmjs.org/"
    Deploy-Start "http://nexus.ynhtapp.com/repository/npm-hdi/"

  } catch {
      Write-Host "An error occurred: $_" -ForegroundColor Red
      return;
  }
}


function Deploy-Start { param ([string]$registry)
  if (-not $registry) {
    Write-Host "请设置仓库地址" -ForegroundColor Red
    return
  }
  Write-Host "设置仓库地址：$registry"
  node ./deploy.js $registry

  if ($LASTEXITCODE -ne 0) {
    Write-Host "设置仓库地址出错：$registry" -ForegroundColor Red
    exit $LASTEXITCODE
  }

  Write-Host "开始发布到：$registry"
  npm publish

  # 检查 npm publish 是否成功
  if ($LASTEXITCODE -ne 0) {
      Write-Host "发布失败：$registry" -ForegroundColor Red
      exit $LASTEXITCODE
  }
  Write-Host "发布成功：$registry" -ForegroundColor Green
}

Deploy-Action


