document.addEventListener('DOMContentLoaded', function () {
  const imageUpload = document.getElementById('imageUpload');
  const dimensionOptions = document.getElementById('dimensionOptions');
  const cropSection = document.getElementById('cropSection');
  const cropContainer = document.getElementById('cropContainer');
  const cropWidth = document.getElementById('cropWidth');
  const cropHeight = document.getElementById('cropHeight');
  const previewSection = document.getElementById('previewSection');
  const croppedImage = document.getElementById('croppedImage');
  const sizeReductionSection = document.getElementById('sizeReductionSection');
  const downloadSection = document.getElementById('downloadSection');
  const downloadButton = document.getElementById('downloadButton');
  const targetSize = document.getElementById('targetSize');
  const unitSelect = document.getElementById('unitSelect');

  let cropper;
  let currentUnit = 'px';

  const unitsToPixels = {
      px: 1,
      cm: 37.7952755906,
      inch: 96
  };

  imageUpload.addEventListener('change', function (event) {
      const file = event.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
              cropContainer.innerHTML = `<img id="imageToCrop" src="${e.target.result}" class="img-fluid">`;
              dimensionOptions.classList.remove('d-none');
              cropSection.classList.remove('d-none');
              initializeCropper();
          };
          reader.readAsDataURL(file);
      }
  });

  unitSelect.addEventListener('change', function () {
      currentUnit = unitSelect.value;
      updateCropperDimensions();
  });

  cropWidth.addEventListener('input', function () {
      updateCropper();
  });

  cropHeight.addEventListener('input', function () {
      updateCropper();
  });

  function initializeCropper() {
      const imageToCrop = document.getElementById('imageToCrop');
      cropper = new Cropper(imageToCrop, {
          aspectRatio: NaN,
          autoCropArea: 0.5,
          movable: true,
          scalable: true,
          crop(event) {
              const { width, height } = cropper.getCropBoxData();
              cropWidth.value = formatValue(convertPixelsToCurrentUnit(width));
              cropHeight.value = formatValue(convertPixelsToCurrentUnit(height));
          }
      });
  }

  function formatValue(value) {
      if (currentUnit === 'px') {
          return Math.round(value); // No decimal places for pixels
      } else {
          return value.toFixed(1); // 1 decimal place for cm and inch
      }
  }

  function convertPixelsToCurrentUnit(value) {
      return value / unitsToPixels[currentUnit];
  }

  function convertCurrentUnitToPixels(value) {
      return value * unitsToPixels[currentUnit];
  }

  function updateCropper() {
      const width = convertCurrentUnitToPixels(cropWidth.value);
      const height = convertCurrentUnitToPixels(cropHeight.value);

      // Get the crop box data and update it
      const cropBoxData = cropper.getCropBoxData();
      cropBoxData.width = width;
      cropBoxData.height = height;
      cropper.setCropBoxData(cropBoxData);

      // Update the cropper instance to ensure the dimensions are applied
      cropper.setCropBoxData(cropBoxData);
  }

  function updateCropperDimensions() {
      const cropData = cropper.getCropBoxData();
      cropWidth.value = formatValue(convertPixelsToCurrentUnit(cropData.width));
      cropHeight.value = formatValue(convertPixelsToCurrentUnit(cropData.height));
  }

  document.getElementById('cropButton').addEventListener('click', function () {
      const cropBoxData = cropper.getCropBoxData();
      const canvas = cropper.getCroppedCanvas({
          width: cropBoxData.width,
          height: cropBoxData.height
      });
      croppedImage.src = canvas.toDataURL('image/png');
      previewSection.classList.remove('d-none');
      sizeReductionSection.classList.remove('d-none');
      downloadSection.classList.remove('d-none');
  });

  downloadButton.addEventListener('click', function () {
      const cropBoxData = cropper.getCropBoxData();
      const canvas = cropper.getCroppedCanvas({
          width: cropBoxData.width,
          height: cropBoxData.height
      });
      const desiredSizeKB = targetSize.value * 1024;

      canvas.toBlob(function (blob) {
          if (blob.size > desiredSizeKB) {
              const quality = desiredSizeKB / blob.size;
              canvas.toBlob(function (newBlob) {
                  downloadImage(URL.createObjectURL(newBlob));
              }, 'image/jpeg', quality);
          } else {
              downloadImage(URL.createObjectURL(blob));
          }
      }, 'image/jpeg');
  });

  function downloadImage(dataUrl) {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'resized-image.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  }
});
