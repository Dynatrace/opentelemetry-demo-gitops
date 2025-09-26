output "AstroshopImageProviderAPIUrl" {
  value = "${module.image_processing.image_api_invoke_url}/${var.stage}"
}
