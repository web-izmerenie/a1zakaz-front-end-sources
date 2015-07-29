if [ -z "$PARENT_DEPLOY_SCRIPT" ]; then YOUR_SUBJECT="./_deploy/$(basename "$0")" WD="$(dirname "$0")/../" ../deploy.sh; exit "$?"; fi

info_inline "Deprivation of privileges group and others"
run_inline_answer chmod -R go-rwx .
