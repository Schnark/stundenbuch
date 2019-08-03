NAME = stundenbuch
CONTENTS = img js l10n index.html style.css manifest.webapp
ICONPRE = img/icon-

.PHONY: all
all: $(NAME).zip $(NAME).manifest.webapp github.manifest.webapp

.PHONY: clean
clean:
	find . -name '*~' -delete

.PHONY: icons
icons: $(ICONPRE)128.png $(ICONPRE)512.png

$(ICONPRE)128.png: icon.svg
	rsvg-convert -w 128 icon.svg -o $(ICONPRE)128.png
	optipng -o7 $(ICONPRE)128.png

$(ICONPRE)512.png: icon.svg
	rsvg-convert -w 512 icon.svg -o $(ICONPRE)512.png
	optipng -o7 $(ICONPRE)512.png

.PHONY: l10n-files
l10n-files: l10n-source/combined/de.txt l10n-source/combined/en.txt l10n-source/combined/la.txt

.PHONY: encrypt
encrypt: l10n/de.xtea l10n/en.xtea l10n/la.xtea

DE_FILES = l10n-source/de.txt l10n-source/interface-de.txt l10n-source/biblia-de.txt l10n-source/lectionis-de.txt l10n-source/regional-de.txt l10n-source/catalogus-de.txt l10n-source/audio-de.txt

EN_FILES = l10n-source/en.txt l10n-source/interface-en.txt l10n-source/biblia-en.txt l10n-source/lectionis-en.txt l10n-source/catalogus-en.txt l10n-source/audio-en.txt

LA_FILES = l10n-source/la.txt l10n-source/interface-la.txt l10n-source/biblia-la.txt l10n-source/lectionis-la.txt l10n-source/catalogus-la.txt l10n-source/audio-la.txt

l10n-source/combined/de.txt: $(DE_FILES)
	paste -s -d"\n" $(DE_FILES) > l10n-source/combined/de.txt

l10n-source/combined/en.txt: $(EN_FILES)
	paste -s -d"\n" $(EN_FILES) > l10n-source/combined/en.txt

l10n-source/combined/la.txt: $(LA_FILES)
	paste -s -d"\n" $(LA_FILES) > l10n-source/combined/la.txt

l10n/de.xtea: l10n-source/combined/de.txt
	./encrypt.sh de

l10n/en.xtea: l10n-source/combined/en.txt
	./encrypt.sh en

l10n/la.xtea: l10n-source/combined/la.txt
	./encrypt.sh la

$(NAME).zip: clean icons encrypt $(CONTENTS)
	rm -f $(NAME).zip
	zip -r -9 $(NAME).zip $(CONTENTS)

#the sed script does the following:
#look for the line with "launch_path"
#replace it with the apropriate "package_path"
#add the size of the zip before that line
#yes, the quoting is a mess

$(NAME).manifest.webapp: manifest.webapp $(NAME).zip
	sed manifest.webapp -e '/launch_path/ {s/"launch_path"\s*:\s*"[^"]*"/"package_path": "http:\/\/localhost:8080\/$(NAME).zip"/ ; e stat --format="\t\\"size\\": %s," $(NAME).zip'$$'\n''}' > $(NAME).manifest.webapp

github.manifest.webapp: manifest.webapp $(NAME).zip
	sed manifest.webapp -e '/launch_path/ {s/"launch_path"\s*:\s*"[^"]*"/"package_path": "https:\/\/schnark.github.io\/$(NAME)\/$(NAME).zip"/ ; e stat --format="\t\\"size\\": %s," $(NAME).zip'$$'\n''}' > github.manifest.webapp