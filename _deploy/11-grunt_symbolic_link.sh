if [ -z "$PARENT_DEPLOY_SCRIPT" ]; then YOUR_SUBJECT="./_deploy/$(basename "$0")" WD="$(dirname "$0")/../" ../deploy.sh; exit "$?"; fi

info_inline "Creating symbolic link to grunt-cli"
rm ./grunt &>/dev/null
if ln -s ./node_modules/.bin/grunt ./grunt &>/dev/null; then ok; else err; fi
