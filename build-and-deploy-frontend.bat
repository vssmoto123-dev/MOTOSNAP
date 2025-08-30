@echo OFF

echo =====================================================
echo           STARTING FRONTEND BUILD PROCESS
echo =====================================================

REM Step 1: Navigate to the frontend directory and build it
echo.
echo [1/4] Building Next.js frontend...
cd motosnap-client
call npm run build

REM Check if the build was successful
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Frontend build failed.
    cd ..
    goto :EOF
)
echo Frontend build completed successfully.
cd ..

REM Step 2: Clean the backend's static resources directory
echo.
echo [2/4] Cleaning backend static directory...
IF EXIST .\workshop\src\main\resources\static (
    rmdir /S /Q .\workshop\src\main\resources\static
)

REM Step 3: Recreate the static directory
echo.
echo [3/4] Recreating backend static directory...
mkdir .\workshop\src\main\resources\static

REM Step 4: Copy the new build files from the 'out' directory
echo.
echo [4/4] Copying build files to backend...
xcopy /E /I /Y .\motosnap-client\out .\workshop\src\main\resources\static


echo.
echo =====================================================
echo      FRONTEND DEPLOYMENT TO BACKEND COMPLETE
echo =====================================================
echo.
echo You can now build and run your Spring Boot application.

:EOF
