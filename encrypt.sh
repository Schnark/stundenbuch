#!/bin/sh
pw=`cat l10n-source/password.txt`
phantomjs encrypt.js l10n-source/combined/$1.txt $pw | base64 -d > l10n/$1.xtea
