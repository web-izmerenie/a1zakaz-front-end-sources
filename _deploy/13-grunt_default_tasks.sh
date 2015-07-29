if [ -z "$PARENT_DEPLOY_SCRIPT" ]; then YOUR_SUBJECT="./_deploy/$(basename "$0")" WD="$(dirname "$0")/../" ../deploy.sh; exit "$?"; fi

info "Starting grunt default tasks"
if ./grunt; then
	info_inline "Grunt default tasks status:"; ok;
else err; fi
