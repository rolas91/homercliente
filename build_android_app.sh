#!/bin/sh

#Actualizamos la versión en el config.xml
CURRENT=`pwd`
file="config.xml"
version=`cat config.xml | grep -P 'version="[0-9\.]*"' -o`
previous_version=`echo $version | grep -P '([0-9]+)(?!.*[0-9])' -o`
num=$((previous_version+1))
sed="s/$previous_version/$num/"
new_version=`echo $version | sed $sed`
echo "================================================================================="
echo "Building new version: $new_version"
sed_params="-i s/$version/$new_version/ $file"
sed $sed_params

#Construimos el proyecto para producción
ionic cordova build android --prod --release
#Luego nos movemos a la carpeta del android para poder crear el bundle
cd platforms/android/
#Creamos el bundle
./gradlew bundle

#regresamos a la carpeta raiz del proyecto
cd ../..

#Firmamos el bundle
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore homer.keystore -storepass numu2k2020 ./platforms/android/app/build/outputs/bundle/release/app.aab homer

#si existe eliminanos el bundle anterior (el bundle ya firmado)
rm ./platforms/android/app/build/outputs/bundle/release/homer.aab

#Por último realizamos el zipalign del bundle
zipalign -v 4 ./platforms/android/app/build/outputs/bundle/release/app.aab ./platforms/android/app/build/outputs/bundle/release/homer.aab



#imprimimos el path en la consola
echo "Bundle para Android creado correctamente en la siguiente dirección $CURRENT/platforms/android/app/build/outputs/bundle/release/homer.aab"

#intentamos abrir la carpeta donde se creó el bundle
xdg-open ./platforms/android/app/build/outputs/bundle/release/
