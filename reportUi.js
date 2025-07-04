
    // Sample data (this would come from API in real implementation)
const reportData = {
  Patient_Id: "patient_id",
  Patient_Name: "patient_name",
  Collect_Date: "collected_date",
  Report_Date: "report_date",
  Age: "age",
  Sex: "patient_gender",
  Investigation:"Investigation_name",
  Normal_Value:"normal_value",
  Test_Value:"test_result",
  Barcode: "XYZ20250623130355",
  
  Doctor_Email: "doctor_email",
  Doctor_Id: "doctor_id",
  Referred_By : "doctor_name",
  Doctor_Phone: "doctor_phone",
  
  
  Hospital_Name: "hospital_name",
  Id_No: "id_no",
  
  
  Patient_Address: "patient_address",
  Patient_Email: "patient_email",
  Date: "date",
  Patient_Phone: "patient_phone",
  
  user_Name:"user_name",
  blood_group:"blood_group",
  observation:"observation",
  description:"description",
  signature_id:"signature_id",
  department_Name:"department_name",
  designation :"designation",
  Created_At: "created_at",
 investigation_Date:"investigation_date",
 
 
precautions:"precautions",
adult_Lowest_Value:"adult_lowest",
adult_Highest:"adult_highest",
female_Lowest:"female_lowest",
female_Highest:"female_highest",
children_Lowest:"children_lowest",
children_Highest:"children_highest",
descriptive_Range:"descriptive_range",
female_desc_range:"female_desc_range",
children_desc_range:"children_desc_range",




};

let globalApiData = null;
let isApiLoading = false;

let cropZoom = 1;
let cropOffsetX = 0;
let cropOffsetY = 0;
let isDragging = false;
let startX, startY;
let currentCropRatio = 'A4';

// Variables for pagination
let currentLabelPage = 1;
let currentValuePage = 1;
const itemsPerPage = 6;

let selectedPage = null;
let selectedBackground = null;
let customBackgroundImage = null;


const builtInBackgrounds = {
  none: null,
  letterhead: null,
  grid: null
};

// Add this after the cropZoom variable declarations
document.getElementById('zoomPercentage').addEventListener('change', function(e) {
  const percentage = parseInt(e.target.value);
  if (!isNaN(percentage)) {
    setCropZoom(percentage / 100);
  }
});

async function fetchAndCacheApiData() {
  // If already loading, wait for it to complete
  if (isApiLoading) {
    await new Promise(resolve => {
      const check = () => {
        if (!isApiLoading) resolve();
        else setTimeout(check, 100);
      };
      check();
    });
    return globalApiData;
  }

  // If already cached, return cached data
  if (globalApiData) {
    return globalApiData;
  }

  try {
    isApiLoading = true;
    const token = localStorage.getItem('medtoken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('medtoken', token);

    const response = await fetch('http://192.168.1.6:3000/api/allkey', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch report data');
    }

    // Cache the data globally
    globalApiData = data;
    return data;
  } catch (error) {
    console.error('Error fetching API data:', error);
    throw error;
  } finally {
    isApiLoading = false;
  }
}


function setCropZoom(zoom) {
  const cropImage = document.getElementById('cropImage');
  
  // Calculate the minimum zoom level where the image fits exactly in the container
  const container = document.querySelector('.crop-container');
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  
  const imgWidth = cropImage.naturalWidth;
  const imgHeight = cropImage.naturalHeight;
  
  const minScale = Math.min(
    containerWidth / imgWidth,
    containerHeight / imgHeight
  );
  
  // Convert zoom to percentage (0-150%)
  const percentage = Math.round(zoom * 100);
  
  // Ensure percentage stays within bounds (minScale to 150)
  const clampedPercentage = Math.max(Math.round(minScale * 100), Math.min(150, percentage));
  
  // Convert back to zoom factor
  cropZoom = clampedPercentage / 100;
  
  document.getElementById('zoomPercentage').value = clampedPercentage;
  document.getElementById('cropImage').style.transform = `translate(${cropOffsetX}px, ${cropOffsetY}px) scale(${cropZoom})`;
}
// Update the existing zoom functions to use setCropZoom
function zoomCropIn() {
  const currentPercentage = parseInt(document.getElementById('zoomPercentage').value);
  if (currentPercentage < 150) {
    setCropZoom(cropZoom + 0.1);
  }
}

function zoomCropOut() {
  const currentPercentage = parseInt(document.getElementById('zoomPercentage').value);
  const cropImage = document.getElementById('cropImage');
  
  // Calculate the minimum zoom level where the image fits exactly in the container
  const container = document.querySelector('.crop-container');
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  
  const imgWidth = cropImage.naturalWidth;
  const imgHeight = cropImage.naturalHeight;
  
  const minScale = Math.min(
    containerWidth / imgWidth,
    containerHeight / imgHeight
  );
  
  // Only zoom out if we're above the minimum scale
  if (currentPercentage > minScale * 100) {
    setCropZoom(cropZoom - 0.1);
  }
}

function resetCropZoom() {
  const cropImage = document.getElementById('cropImage');
  const container = document.querySelector('.crop-container');
  
  // Calculate the initial scale that fits the image in the container
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  
  const imgWidth = cropImage.naturalWidth;
  const imgHeight = cropImage.naturalHeight;
  
  const initialScale = Math.min(
    containerWidth / imgWidth,
    containerHeight / imgHeight
  );
  
  setCropZoom(initialScale);
}

// Update the image load handler to set initial percentage


// Helper function to crop image


// Helper function to get crop dimensions


// Update the showCropModal function
function showCropModal(imageSrc) {
  document.getElementById('paperSelectModal').style.display = 'none';
  document.getElementById('cropModal').style.display = 'flex';
  
  const cropImage = document.getElementById('cropImage');
  cropImage.src = imageSrc;
  
  // Reset crop settings
  cropZoom = 1;
  cropOffsetX = 0;
  cropOffsetY = 0;
  
  // Set initial crop ratio based on selected page
  document.getElementById('cropRatio').value = selectedPage;
  currentCropRatio = selectedPage;
  updateCropOverlay();
  
  // Initialize dragging
  cropImage.onmousedown = function(e) {
    if (e.target === cropImage) {
      isDragging = true;
      startX = e.clientX - cropOffsetX;
      startY = e.clientY - cropOffsetY;
      e.preventDefault();
    }
  };
  
  document.onmousemove = function(e) {
    if (!isDragging) return;
    
    cropOffsetX = e.clientX - startX;
    cropOffsetY = e.clientY - startY;
    
    cropImage.style.transform = `translate(${cropOffsetX}px, ${cropOffsetY}px) scale(${cropZoom})`;
  };
  
  document.onmouseup = function() {
    isDragging = false;
  };
  
  // Zoom with mouse wheel
  cropImage.onwheel = function(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.02 : 0.02;
    setCropZoom(cropZoom + delta);
  };
  
  cropImage.onload = function() {
    cropImage.style.transform = 'translate(0, 0) scale(1)';
    
    const container = document.querySelector('.crop-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Get natural dimensions of the image
    const imgWidth = cropImage.naturalWidth;
    const imgHeight = cropImage.naturalHeight;
    
    // Calculate scale to fit container while maintaining aspect ratio
    const scale = Math.min(
      containerWidth / imgWidth,
      containerHeight / imgHeight
    );
    
    // Apply initial scale and center the image
    cropZoom = scale;
    cropOffsetX = (containerWidth - imgWidth * cropZoom) / 2;
    cropOffsetY = (containerHeight - imgHeight * cropZoom) / 2;
    
    cropImage.style.width = `${imgWidth}px`;
    cropImage.style.height = `${imgHeight}px`;
    cropImage.style.transform = `translate(${cropOffsetX}px, ${cropOffsetY}px) scale(${cropZoom})`;
    
    // Set initial zoom percentage
    setCropZoom(cropZoom);
  };
}

function updateCropOverlay() {
  const { w, h } = paperSizes[currentCropRatio];
  const container = document.querySelector('.crop-container');
  const overlay = document.querySelector('.crop-overlay');
  
  // Calculate aspect ratio
  const aspectRatio = w / h;
  
  // Set container size while maintaining aspect ratio
  if (aspectRatio > 1) {
    // Wider than tall
    container.style.width = '600px';
    container.style.height = `${600 / aspectRatio}px`;
  } else {
    // Taller than wide
    container.style.height = '400px';
    container.style.width = `${400 * aspectRatio}px`;
  }
  
  // Position overlay to cover the container
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.left = '0';
  overlay.style.top = '0';
}

function getCropDimensions() {
  const container = document.querySelector('.crop-container');
  const overlay = document.querySelector('.crop-overlay');
  const img = document.getElementById('cropImage');
  
  // Get relative positions
  const containerRect = container.getBoundingClientRect();
  const overlayRect = overlay.getBoundingClientRect();
  const imgRect = img.getBoundingClientRect();
  
  // Calculate crop coordinates relative to image
  const scaleX = img.naturalWidth / imgRect.width;
  const scaleY = img.naturalHeight / imgRect.height;
  
  // Ensure we don't get negative values
  const cropX = Math.max(0, (overlayRect.left - imgRect.left) * scaleX);
  const cropY = Math.max(0, (overlayRect.top - imgRect.top) * scaleY);
  
  // Ensure we don't exceed image dimensions
  const cropWidth = Math.min(
    overlayRect.width * scaleX,
    img.naturalWidth - cropX
  );
  const cropHeight = Math.min(
    overlayRect.height * scaleY,
    img.naturalHeight - cropY
  );
  
  return { 
    cropX, 
    cropY, 
    cropWidth, 
    cropHeight 
  };
}


async function fetchReportData() {
  try {
    const data = await fetchAndCacheApiData();
    return {
      keys: data.keys,
      signatureData: data.signatureData
    };
  } catch (error) {
    console.error('Error in fetchReportData:', error);
    throw error;
  }
}


function cropImage(imageSrc, cropX, cropY, cropWidth, cropHeight) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
      try {
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        ctx.drawImage(
          img, 
          cropX, cropY, cropWidth, cropHeight, // source rectangle
          0, 0, cropWidth, cropHeight         // destination rectangle
        );
        resolve(canvas.toDataURL());
      } catch (e) {
        reject(e);
      }
    };
    
    img.onerror = function() {
      reject(new Error('Failed to load image for cropping'));
    };
    
    img.src = imageSrc;
  });
}


function skipCrop() {
  document.getElementById('cropModal').style.display = 'none';
  setupCanvasWithBackground(document.getElementById('cropImage').src);
}


async function applyCrop() {
  const img = document.getElementById('cropImage');
  
  if (!img.complete || img.naturalWidth === 0) {
    alert('Image is not loaded yet. Please wait and try again.');
    return;
  }

  try {
    const { cropX, cropY, cropWidth, cropHeight } = getCropDimensions();
    
    if (cropWidth <= 0 || cropHeight <= 0) {
      throw new Error('Invalid crop dimensions');
    }
    
    const croppedImage = await cropImage(img.src, cropX, cropY, cropWidth, cropHeight);
    localStorage.setItem('selectedBackground', croppedImage); // Save to single key
    document.getElementById('cropModal').style.display = 'none';
    setupCanvasWithBackground(croppedImage);
  } catch (error) {
    console.error('Error cropping image:', error);
    alert(`Error cropping image: ${error.message}. Please try again.`);
  }
}

function loadSavedSettings() {
  // Load page size
  const savedPage = localStorage.getItem('selectedPage');
  if (savedPage && paperSizes[savedPage]) {
    selectPage(savedPage);
  }
  
  // Load background image (either built-in or custom)
  const savedBackground = localStorage.getItem('selectedBackground');
  if (savedBackground) {
    // Check if this is one of our built-in backgrounds
    if (savedBackground === builtInBackgrounds.letterhead) {
      document.querySelector('.option[onclick="selectBackground(\'letterhead\')"]').classList.add('selected');
    } else if (savedBackground === builtInBackgrounds.grid) {
      document.querySelector('.option[onclick="selectBackground(\'grid\')"]').classList.add('selected');
    } else if (savedBackground === null || savedBackground === 'null') {
      document.querySelector('.option[onclick="selectBackground(\'none\')"]').classList.add('selected');
    } else {
      // It's a custom image
      customBackgroundImage = savedBackground;
      const customPreview = document.querySelector('.option[onclick="selectBackground(\'custom\')"] .preview');
      if (customPreview) {
        customPreview.style.backgroundImage = `url(${customBackgroundImage})`;
        customPreview.textContent = '';
      }
      document.querySelector('.option[onclick="selectBackground(\'custom\')"]').classList.add('selected');
    }
    
    selectedBackground = savedBackground;
  }
}


function setupCanvasWithBackground(bgImage) {
  const { w, h } = paperSizes[selectedPage];
  const pw = w * PPM, ph = h * PPM;
  canvas.style.width = `${pw}px`;
  canvas.style.height = `${ph}px`;
  
  // Set letterhead background
  const letterheadBg = document.getElementById('letterheadBackground');
  letterheadBg.style.width = `${pw}px`;
  letterheadBg.style.height = `${ph}px`;
  
  if (bgImage) {
    // Apply the background image (works with both base64 and URL)
    letterheadBg.style.backgroundImage = `url(${bgImage})`;
    letterheadBg.style.display = 'block';
    // Save to localStorage
    localStorage.setItem('selectedBackground', bgImage);
  } else {
    // No background
    letterheadBg.style.backgroundImage = 'none';
    letterheadBg.style.display = 'none';
    localStorage.setItem('selectedBackground', 'null');
  }
  
  document.getElementById('paperSelectModal').style.display = 'none';
  enableInteractions();
}


// Update crop ratio when changed
document.getElementById('cropRatio').addEventListener('change', function(e) {
  currentCropRatio = e.target.value;
  updateCropOverlay();
});

// Function to generate label elements
// Function to generate label elements (hardcoded)
function generateLabels(page = 1) {
  const labelsContainer = document.getElementById('dynamic-labels');
  labelsContainer.innerHTML = '';
  
  // Hardcoded labels as before
  const hardcodedLabels = [
    "Patient_Id_:",
    "Patient_Name_:",
    "Collect_On_:",
    "Report_On_:",
    "Age_:",
    "Sex_:",
    "Investigation",
    "Normal_Value",
    "Test_Value",
    "Barcode",
    "Doctor_Email_:",
    "Doctor_Id_:",
    "Referred_By_:",
    "Doctor_Phone_:",
    "Hospital_Name_:",
    "Id_No_:",
    "Patient_Address_:",
    "Patient_Email_:",
    "Date_:",
    "Patient_Phone_:",
    "user_Name_:",
    "blood_group_:",
    "observation_:",
    "description_:",
    "signature_id_:",
    "department_Name_:",
    "designation_:",
    "Created_At_:",
    "investigation_Date_:",
    "precautions_:",
    "adult_Lowest_Value_:",
    "adult_Highest_:",
    "female_Lowest_:",
    "female_Highest_:",
    "children_Lowest_:",
    "children_Highest_:",
    "descriptive_Range_:",
    "female_desc_range_:",
    "children_desc_range_:"
  ];
  


  const startIdx = (page - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  
  hardcodedLabels.slice(startIdx, endIdx).forEach(label => {
    const labelDiv = document.createElement('div');
    labelDiv.className = 'draggable-label';
    labelDiv.draggable = true;
    labelDiv.setAttribute('data-label', label);
    labelDiv.textContent = formatLabelText(label);
    labelsContainer.appendChild(labelDiv);
  });
  
  // Show/hide navigation buttons
  const prevLabelsBtn = document.getElementById('prevLabels');
  const nextLabelsBtn = document.getElementById('nextLabels');
  
  prevLabelsBtn.style.display = page > 1 ? 'block' : 'none';
  nextLabelsBtn.style.display = endIdx < hardcodedLabels.length ? 'block' : 'none';
}

// Function to generate value elements
// Function to generate value elements (updated version without colons)
async function generateValues(page = 1) {
  const valuesContainer = document.getElementById('dynamic-values');
  const spinner = valuesContainer.querySelector('.loading-spinner');
  const errorDiv = valuesContainer.querySelector('.error-message');
  
  // Show loading spinner
  if (spinner) spinner.style.display = 'flex';
  if (errorDiv) errorDiv.remove();
  
  try {
    // Create FormData and append medtoken
    const data = await fetchAndCacheApiData();
    
    // Clear container
    valuesContainer.innerHTML = '';
    
    // Add pagination buttons
    const prevBtn = document.createElement('button');
    prevBtn.id = 'prevValues';
    prevBtn.className = 'show-more-btn';
    prevBtn.textContent = 'Previous';
    prevBtn.style.display = page > 1 ? 'block' : 'none';
    prevBtn.onclick = () => {
      currentValuePage--;
      generateValues(currentValuePage);
    };
    
    const nextBtn = document.createElement('button');
    nextBtn.id = 'nextValues';
    nextBtn.className = 'show-more-btn';
    nextBtn.textContent = 'Next';
    
    // Create values
    const keys = data.keys || [];
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const visibleKeys = keys.slice(startIdx, endIdx);
    
    visibleKeys.forEach(key => {
      const valueDiv = document.createElement('div');
      valueDiv.className = 'draggable-label';
      valueDiv.draggable = true;
      valueDiv.setAttribute('data-label', key);
      valueDiv.setAttribute('data-is-value', 'true'); // Mark as value
      valueDiv.textContent = formatValueText(key);
      valuesContainer.appendChild(valueDiv);
    });
    
    // Update next button visibility
    nextBtn.style.display = endIdx < keys.length ? 'block' : 'none';
    nextBtn.onclick = () => {
      currentValuePage++;
      generateValues(currentValuePage);
    };
    
    valuesContainer.appendChild(prevBtn);
    valuesContainer.appendChild(nextBtn);
    
  } catch (error) {
    console.error('Error generating values:', error);
    valuesContainer.innerHTML = `
      <div class="error-message">
        Error loading values: ${error.message}
      </div>
    `;
  } finally {
    if (spinner) spinner.style.display = 'none';
  }
}

async function imageToBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL());
    };
    img.onerror = reject;
    img.src = url;
  });
}

// Helper function to format label text (capitalize and add spaces)
function formatLabelText(key) {
  return key.replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
}

// Helper function to format value text
function formatValueText(value) {
  if (value === null || value === undefined) return '';
  return value.toString();
}

// Event listeners for show more buttons
document.getElementById('nextLabels').addEventListener('click', () => {
  currentLabelPage++;
  generateLabels(currentLabelPage);
});

document.getElementById('prevLabels').addEventListener('click', () => {
  currentLabelPage--;
  generateLabels(currentLabelPage);
});

// document.getElementById('nextValues').addEventListener('click', () => {
//   currentValuePage++;
//   generateValues(currentValuePage);
// });

// document.getElementById('prevValues').addEventListener('click', () => {
//   currentValuePage--;
//   generateValues(currentValuePage);
// });


// Initialize the labels and values when the page loads
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Convert built-in images to base64
    builtInBackgrounds.letterhead = await imageToBase64('./images/letterhead.png');
    builtInBackgrounds.grid = await imageToBase64('./images/MDC.png');
    
    loadSavedSettings();
    generateLabels();
    generateValues().catch(console.error);
    fetchSignatureData().catch(console.error);
    
    document.addEventListener('mouseover', () => {
      document.querySelectorAll('.draggable-label').forEach(lbl => {
        lbl.ondragstart = e => e.dataTransfer.setData('text/plain', lbl.dataset.label);
      });
    });
  } catch (error) {
    console.error('Error loading built-in backgrounds:', error);
  }
});


// Function to send data to server
async function saveDataToServer() {
  const saveButton = document.getElementById('saveToServer');
  const originalText = saveButton.textContent;
  saveButton.disabled = true;
  saveButton.textContent = 'Saving...';
  
  try {
    const builderLayout = localStorage.getItem('builderLayout');
    
    // Check if builderLayout exists and is not empty
    if (!builderLayout || builderLayout === '[]' || builderLayout === 'null') {
      throw new Error('No report layout data found. Please add some elements to the report before saving.');
    }
    
    const selectedBackground = localStorage.getItem('selectedBackground');
    const selectedPage = localStorage.getItem('selectedPage');
    const medtoken = localStorage.getItem('medtoken');
    
    if (!medtoken) {
      throw new Error('Authentication token not found');
    }
    
    const formData = new FormData();
    formData.append('medtoken', medtoken);
    formData.append('builderLayout', builderLayout);
    
    // Only append these if they exist
    if (selectedBackground && selectedBackground !== 'null') {
      formData.append('selectedBackground', selectedBackground);
    }
    if (selectedPage) {
      formData.append('selectedPage', selectedPage);
    }
    
    const response = await fetch('http://192.168.1.6:3000/reportsetting/addreportsetting', {
      method: 'POST',
      body: formData
    });
    
    // First check if response is HTML (error case)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const text = await response.text();
      throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
    }
    
    if (!response.ok) {
      // Try to parse as JSON, but fallback to text if it fails
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      } catch (e) {
        const text = await response.text();
        throw new Error(text || `Request failed with status ${response.status}`);
      }
    }
    
    const result = await response.json();

    // Clear the workspace and local storage only after successful save
    document.querySelectorAll('.label-box').forEach(label => label.remove());
    selectedElement = null;
    localStorage.removeItem('builderLayout');
    localStorage.removeItem('selectedBackground');
    localStorage.removeItem('selectedPage');

    alert('Data saved successfully! Workspace cleared.');
    console.log('Server response:', result);
    
  } catch (error) {
    console.error('Error saving data:', error);
    if (error.message.includes('No report layout data found')) {
      alert('Please add some elements to the report before saving.');
    } else {
      alert(`Error saving data: ${error.message}`);
    }
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = originalText;
  }
}

// Add click event listener to the button
document.getElementById('saveToServer').addEventListener('click', saveDataToServer);

function selectBackground(bgType) {
  selectedBackground = bgType;
  
  // Remove selection from all background options
  document.querySelectorAll('.selection-section:nth-child(2) .option').forEach(option => {
    option.classList.remove('selected');
  });
  
  // Add selection to clicked option
  const selectedOption = document.querySelector(`.option[onclick="selectBackground('${bgType}')"]`);
  if (selectedOption) {
    selectedOption.classList.add('selected');
  }
  
  // Handle custom image upload
  if (bgType === 'custom') {
    document.getElementById('customBgUpload').click();
  }
}
// Handle custom background upload
document.getElementById('customBgUpload').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      customBackgroundImage = event.target.result;
      // Update the preview
      const customPreview = document.querySelector('.option[onclick="selectBackground(\'custom\')"] .preview');
      if (customPreview) {
        customPreview.style.backgroundImage = `url(${customBackgroundImage})`;
        customPreview.textContent = '';
      }
    };
    reader.readAsDataURL(file);
  }
});

let guideSettings = {
  enabled: true,
  distanceEnabled: true,
  guideColor: '#e74c3c',
  distanceColor: '#2ecc71',
  minSpacing: 20
};

    const paperSizes = {
      A4: { w: 210, h: 297 },
      A5: { w: 148, h: 210 },
      B4: { w: 250, h: 353 },
      Letter: { w: 216, h: 279 }
    };
    const PPM = 3.78;
    let zoomLevel = 1, editMode = true, selectedElement = null;


    
    const canvas = document.getElementById('canvas'),
    xGuide = document.getElementById('xGuide'), yGuide = document.getElementById('yGuide');

function selectPage(page) {
  document.querySelectorAll('.option[data-size]').forEach(option => {
    option.classList.remove('selected');
  });
  const selectedOption = document.querySelector(`.option[data-size="${page}"]`);
  selectedOption.classList.add('selected');
  selectedPage = page;
  localStorage.setItem('selectedPage', page); // Save to local storage
}

async function fetchSignatureData() {
  const signaturesContainer = document.getElementById('dynamic-signatures');
  const spinner = signaturesContainer.querySelector('.loading-spinner');
  
  try {
    if (spinner) spinner.style.display = 'flex';
    
    const data = await fetchAndCacheApiData();
    
    if (!data.signatureData) {
      throw new Error('No signature data available');
    }
    
    signatureData = data.signatureData;
    generateSignatures();
    
  } catch (error) {
    console.error('Error fetching signatures:', error);
    // Handle error...
  } finally {
    if (spinner) spinner.style.display = 'none';
  }
}

function startDesigning() {
  if (!selectedPage) {
    alert('Please select a page size!');
    return;
  }
  
  // For custom background, show crop modal if image is selected
  if (selectedBackground === 'custom') {
    const customBgInput = document.getElementById('customBgUpload');
    if (customBgInput.files.length > 0) {
      const file = customBgInput.files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        showCropModal(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      // No custom image selected, proceed without background
      setupCanvasWithBackground(null);
    }
    return;
  }
  
  // For built-in backgrounds, skip cropping
  if (selectedBackground === 'none' || 
      selectedBackground === 'letterhead' || 
      selectedBackground === 'grid') {
    setupCanvasWithBackground(builtInBackgrounds[selectedBackground]);
    return;
  }
  
  // Default case (shouldn't normally reach here)
  setupCanvasWithBackground(null);
}


// Add this to your variables section
let signatureData = [];

// Add this to your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
  generateLabels();
  generateValues();
  
  // Add click handler for signature header
  document.querySelector('.signature-header').addEventListener('click', function() {
    const container = document.querySelector('.signature-container');
    container.classList.toggle('expanded');
    this.setAttribute('aria-expanded', container.classList.contains('expanded'));
    container.setAttribute('aria-hidden', !container.classList.contains('expanded'));
  });

  // Add click handler for setup signature link

  
  // Make sure the draggable functionality works for dynamically generated elements
  document.addEventListener('mouseover', () => {
    document.querySelectorAll('.draggable-label').forEach(lbl => {
      lbl.ondragstart = e => e.dataTransfer.setData('text/plain', lbl.dataset.label);
    });
  });
fetchSignatureData();

});

// Function to fetch signature data from API


function generateSignatures() {
  const signaturesContainer = document.getElementById('dynamic-signatures');
  signaturesContainer.innerHTML = '';
  
  if (!signatureData || signatureData.length === 0) {
    signaturesContainer.innerHTML = `
      <div style="color: #ecf0f1; padding: 10px; text-align: center;">
        No signatures available. Click "Setup Signature" to configure.
      </div>
    `;
    return;
  }

  const signatureList = document.createElement('div');
  signatureList.className = 'signature-list';
  
  signatureData.forEach(signature => {
    const signatureItem = document.createElement('div');
    signatureItem.className = 'signature-item-container';
    
    // Use new class 'signature-item-header' for individual signature headers
    const signatureItemHeader = document.createElement('div');
    signatureItemHeader.className = 'signature-item-header'; // Changed from signature-header
    signatureItemHeader.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      <strong>${signature.sign_name}</strong>
    `;
    signatureItem.appendChild(signatureItemHeader);
    
    // Rest of the signature item code remains the same...
    const componentsContainer = document.createElement('div');
    componentsContainer.className = 'signature-components';
    
    if (signature.display_text) {
   const displayTextDiv = document.createElement('div');
  displayTextDiv.className = 'draggable-label signature-display-text';
  displayTextDiv.draggable = true;
  displayTextDiv.setAttribute('data-label', `display_${signature.sign_name}`);
  displayTextDiv.setAttribute('data-is-value', 'false');
  displayTextDiv.textContent = signature.display_text;
  componentsContainer.appendChild(displayTextDiv);
    }
    
    if (signature.designation) {
   const designationDiv = document.createElement('div');
  designationDiv.className = 'draggable-label signature-display-text';
  designationDiv.draggable = true;
  designationDiv.setAttribute('data-label', `designation_${signature.sign_name}`);
  designationDiv.setAttribute('data-is-value', 'false');
  designationDiv.textContent = signature.designation;
  componentsContainer.appendChild(designationDiv);
    }
    
   const signatureImageDiv = document.createElement('div');
signatureImageDiv.className = 'draggable-label signature-image-label';
signatureImageDiv.draggable = true;
signatureImageDiv.setAttribute('data-label', `signature_image_${signature.sign_name}`);
signatureImageDiv.setAttribute('data-is-value', 'false');
    
    const img = document.createElement('img');
    img.src = signature.user_id ? `https://clients.medecue.in/images/sign/${signature.user_id}.png` : './images/signature.png';
    img.alt = 'Signature';
    img.style.maxWidth = '150px';
    img.style.maxHeight = '60px';
    img.style.display = 'block';
    img.style.margin = '0 auto';
    
    img.onerror = function() {
      this.src = './images/signature.png';
    };
    
    signatureImageDiv.appendChild(img);
    componentsContainer.appendChild(signatureImageDiv);
    
    signatureItem.appendChild(componentsContainer);
    signatureList.appendChild(signatureItem);
  });
  
  signaturesContainer.appendChild(signatureList);
}



function setupCanvas() {
  const { w, h } = paperSizes[selectedPage];
  const pw = w * PPM, ph = h * PPM;
  canvas.style.width = `${pw}px`;
  canvas.style.height = `${ph}px`;
  
  // Set letterhead background
  const letterheadBg = document.getElementById('letterheadBackground');
  letterheadBg.style.width = `${pw}px`;
  letterheadBg.style.height = `${ph}px`;
  
  // Apply selected background
  const savedBackground = localStorage.getItem('selectedBackground');
  if (savedBackground && savedBackground !== 'null') {
    letterheadBg.style.backgroundImage = `url(${savedBackground})`;
    letterheadBg.style.display = 'block';
  } else {
    letterheadBg.style.backgroundImage = 'none';
    letterheadBg.style.display = 'none';
  }
  
  document.getElementById('paperSelectModal').style.display = 'none';
  enableInteractions();
}


    function setPaperSize(){
      const sel = document.getElementById('paperSize').value;
      const {w,h} = paperSizes[sel];
      const pw = w*PPM, ph = h*PPM;
      canvas.style.width = `${pw}px`;
      canvas.style.height = `${ph}px`;
      document.getElementById('paperSelectModal').style.display = 'none';
      enableInteractions();
    }

    function enableInteractions(){
    document.querySelectorAll('.draggable-label').forEach(lbl=>{
    lbl.ondragstart=e=>{
      // Use the formatted text for dragging
      e.dataTransfer.setData('text/plain', lbl.textContent);
    };
  });
  
// In your enableInteractions function, update the dragover and drop handlers:
canvas.ondragover = e => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
};

canvas.ondrop = e => {
  e.preventDefault();
  const text = e.dataTransfer.getData('text/plain');
  
  // Check if this is a barcode drop
  if (text === "Barcode") {
    const rect = canvas.getBoundingClientRect();
    createLabel(text, e.clientX - rect.left, e.clientY - rect.top);
  } else {
    const rect = canvas.getBoundingClientRect();
    createLabel(text, e.clientX - rect.left, e.clientY - rect.top);
  }
};

    
document.getElementById('deleteSelected').onclick = () => {
  if (selectedElement) {
    // Check if it's a barcode element or regular label
    if (selectedElement.classList.contains('barcode-element')) {
      selectedElement.remove();
    } else {
      selectedElement.remove();
    }
    saveLayout();
    selectedElement = null;
  }
};

document.addEventListener('keydown', e => {
  if (e.key === 'Delete' && selectedElement) {
    // Check if it's a barcode element or regular label
    if (selectedElement.classList.contains('barcode-element')) {
      selectedElement.remove();
    } else {
      selectedElement.remove();
    }
    saveLayout();
    selectedElement = null;
  }
});     

      document.getElementById('fontSize').onchange=e=>{if(selectedElement){selectedElement.style.fontSize=e.target.value; saveLayout();}};
      document.getElementById('fontColor').onchange=e=>{if(selectedElement){selectedElement.style.color=e.target.value; saveLayout();}};
      document.getElementById('fontFamily').onchange=e=>{if(selectedElement){selectedElement.style.fontFamily=e.target.value; saveLayout();}};
      ['btnBold','btnItalic','btnUnderline','alignLeft','alignCenter','alignRight']
        .forEach(id=>document.getElementById(id).onclick=()=>{
          if(!selectedElement) return;
          const s = selectedElement.style;
          if(id==='btnBold') s.fontWeight = s.fontWeight==='bold'?'normal':'bold';
          if(id==='btnItalic') s.fontStyle = s.fontStyle==='italic'?'normal':'italic';
          if(id==='btnUnderline') s.textDecoration = s.textDecoration==='underline'?'none':'underline';
          if(id==='alignLeft') s.textAlign='left';
          if(id==='alignCenter') s.textAlign='center';
          if(id==='alignRight') s.textAlign='right';
          saveLayout();
        });

      document.getElementById('exportJSON').onclick=()=>{
        localStorage.setItem('builderLayout', JSON.stringify(getLayoutData()));
        alert('Saved JSON');
      };
      document.getElementById('exportPNG').onclick=()=>{
        html2canvas(canvas).then(c=>{ const a=document.createElement('a'); a.download='layout.png'; a.href=c.toDataURL(); a.click(); });
      };

      document.getElementById('clearAllLabels').onclick = () => {
  if (confirm('Are you sure you want to remove all labels from the report?')) {
    document.querySelectorAll('.label-box').forEach(label => label.remove());
    saveLayout();
    selectedElement = null;
  }
};


// Guide controls
document.getElementById('guideColor').onchange = e => {
  guideSettings.guideColor = e.target.value;
  xGuide.style.background = yGuide.style.background = guideSettings.guideColor;
};
document.getElementById('distanceGuideColor').onchange = e => {
  guideSettings.distanceColor = e.target.value;
  xDistanceGuide.style.background = yDistanceGuide.style.background = guideSettings.distanceColor;
};
// document.getElementById('minSpacing').oninput = e => {
//   guideSettings.minSpacing = parseInt(e.target.value);
//   document.getElementById('minSpacingValue').textContent = `${guideSettings.minSpacing}px`;
// };


// document.getElementById('toggleGuides').addEventListener('change', (e) => {
//   guideSettings.enabled = e.target.checked;
//   if (!guideSettings.enabled) clearSnap();
// });
// document.getElementById('toggleDistanceGuides').addEventListener('change', (e) => {
//   guideSettings.distanceEnabled = e.target.checked;
//   if (!guideSettings.distanceEnabled) {
//     xDistanceGuide.style.display = yDistanceGuide.style.display = 'none';
//     document.getElementById('distanceValue').style.display = 'none';
//   }
// });

// Add to enableInteractions() function
document.getElementById('bgOpacity').oninput = e => {
  document.getElementById('letterheadBackground').style.opacity = e.target.value / 100;
};
document.getElementById('toggleBackground').onclick = () => {
  const bg = document.getElementById('letterheadBackground');
  bg.style.display = bg.style.display === 'none' ? 'block' : 'none';
};

document.querySelector('.labels-header').addEventListener('click', function() {
  const container = document.querySelector('.labels-container');
  container.classList.toggle('expanded');
  
  // Update ARIA attributes for accessibility
  const isExpanded = container.classList.contains('expanded');
  this.setAttribute('aria-expanded', isExpanded);
  container.setAttribute('aria-hidden', !isExpanded);
});

document.querySelector('.values-header').addEventListener('click', function() {
  const container = document.querySelector('.values-container');
  container.classList.toggle('expanded');
  
  // Update ARIA attributes for accessibility
  const isExpanded = container.classList.contains('expanded');
  this.setAttribute('aria-expanded', isExpanded);
  container.setAttribute('aria-hidden', !isExpanded);
});

// Toggle Styles section
document.querySelector('.styles-header').addEventListener('click', function() {
  const container = document.querySelector('.styles-container');
  container.classList.toggle('expanded');
  this.setAttribute('aria-expanded', container.classList.contains('expanded'));
  container.setAttribute('aria-hidden', !container.classList.contains('expanded'));
});

// Toggle Background section
document.querySelector('.background-header').addEventListener('click', function() {
  const container = document.querySelector('.background-container');
  container.classList.toggle('expanded');
  this.setAttribute('aria-expanded', container.classList.contains('expanded'));
  container.setAttribute('aria-hidden', !container.classList.contains('expanded'));
});

// Toggle Controls section
document.querySelector('.controls-header').addEventListener('click', function() {
  const container = document.querySelector('.controls-container');
  container.classList.toggle('expanded');
  this.setAttribute('aria-expanded', container.classList.contains('expanded'));
  container.setAttribute('aria-hidden', !container.classList.contains('expanded'));
});

// In your enableInteractions() function, update these:
document.getElementById('deleteSelected').onclick = () => {
  if (selectedElement) {
    // Remove the element regardless of its type
    selectedElement.remove();
    saveLayout();
    selectedElement = null;
  }
};

document.addEventListener('keydown', e => {
  if (e.key === 'Delete' && selectedElement) {
    selectedElement.remove();
    saveLayout();
    selectedElement = null;
  }
});

      loadLayout();
    }

    function generateBarcode(element, value) {
    try {
        JsBarcode(element, value, {
            format: "CODE128", // Most common barcode format
            width: 2,
            height: 50,
            displayValue: true, // Show the text below the barcode
            fontSize: 11,
            margin: 10
        });
    } catch (e) {
        console.error("Barcode generation error:", e);
        // Fallback to showing the text if barcode generation fails
        element.textContent = value;
    }
}


// Modify the createLabel function
function createLabel(text, x, y) {
  // Get canvas dimensions
  const canvasRect = canvas.getBoundingClientRect();
  const canvasWidth = parseInt(canvas.style.width);
  const canvasHeight = parseInt(canvas.style.height);
  
  // Constrain position to be within canvas
  x = Math.max(0, Math.min(x, canvasWidth - 40));
  y = Math.max(0, Math.min(y, canvasHeight - 20));
  
  const div = document.createElement('div');
  div.className = 'label-box';
  
   if (text === "Line") {
    div.className = 'label-box line-element';
    div.style.width = '501px';
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    div.style.height = '0';
    // div.style.borderBottom = '2px dotted #000'; // Add dotted border
  } 

// In the createLabel function, modify the barcode section:
else if (text === "Barcode") {
    div.className = 'label-box barcode-element';
    div.style.width = '160px';
    div.style.height = '60px';
    
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "barcode-svg");
    div.appendChild(svg);
    
      const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.zIndex = '1';
    overlay.style.cursor = 'move';
    div.appendChild(overlay);
    svg.setAttribute("class", "barcode-svg");
    div.appendChild(svg);
    
    // Make sure the resizer is added after the SVG
    const r = document.createElement('div'); 
    r.className = 'resizer'; 
    div.appendChild(r);
    
    // Store the barcode data attribute
    div.setAttribute('data-barcode-value', reportData.Barcode || 'DEMO12345');
    
    // Generate the barcode
    generateBarcode(svg, div.getAttribute('data-barcode-value'));
    
    // Explicitly make draggable and resizable
    makeDraggable(div);
    makeResizable(div, r);
}

else if (text.startsWith('signature_image_')) {
    const signName = text.replace('signature_image_', '');
    const signature = signatureData.find(sig => sig.sign_name === signName);
    
    div.className = 'label-box signature-image';
    div.style.width = '46px'; // Default width
    div.style.height = '45px'; // Default height
    div.setAttribute('data-text', `Signature_${signName}`); // Add this line
    div.setAttribute('data-is-signature', 'true'); // Add this line
    
    const img = document.createElement('img');
    // Use user_id.png if available, otherwise fallback to default signature.png
    img.src = signature?.user_id ? `./signatures/${signature.user_id}.png` : './images/signature.png';
    img.alt = 'Signature';
    img.draggable = false;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    
    // Add error handler in case signature image doesn't exist
    img.onerror = function() {
      this.src = './images/signature.png';
    };
    
    div.appendChild(img);
    
    // Make sure the resizer is added after the image
    const r = document.createElement('div'); 
    r.className = 'resizer'; 
    div.appendChild(r);
    
    // Make draggable and resizable
    makeDraggable(div);
    makeResizable(div, r);
}

  else if (text.startsWith('designation_')) {
    const signName = text.replace('designation_', '');
    const signature = signatureData.find(sig => sig.sign_name === signName);
    if (signature && signature.designation) {
      div.textContent = signature.designation;
      div.setAttribute('data-original-key', `designation_${signName}`);
      div.contentEditable = true;
    }
  }

  else if (text.startsWith('display_')) {
    const signName = text.replace('display_', '');
    const signature = signatureData.find(sig => sig.sign_name === signName);
    if (signature) {
      div.textContent = signature.display_text || '';
      div.setAttribute('data-signature-display', 'true');
      div.setAttribute('data-signature-name', signName);
      div.contentEditable = true;
    }
  }
  // Handle signature name
  else if (signatureData.some(sig => sig.sign_name === text)) {
    const signature = signatureData.find(sig => sig.sign_name === text);
    div.textContent = signature.sign_name;
    div.setAttribute('data-signature', 'true');
    div.setAttribute('data-display-text', signature.display_text || '');
    div.contentEditable = false;
  }

  
  // Handle blank label differently
  else if (text === "Blank Label") {
    div.className = 'label-box';
    div.setAttribute('data-placeholder', 'Enter your text here...');
    div.contentEditable = true;
  }
  // Check if this is a value (from VALUES section)
  else if (Object.values(reportData).includes(text)) {
    div.textContent = text;
    div.contentEditable = true;
    div.setAttribute('data-is-value', 'true'); // Mark as value
  }
  // Check if this is a signature
  else if (signatureData.some(sig => sig.sign_name === text)) {
      div.textContent = signature.sign_name;
    div.setAttribute('data-signature', 'true');
    div.setAttribute('data-display-text', signature.display_text || '');
    div.contentEditable = false;
    div.setAttribute('data-is-value', 'false');
  }
  else {
    // Store the original key in a data attribute
    div.setAttribute('data-original-key', text);
    // Apply the same formatting as in the sidebar
    div.textContent = formatLabelText(text);
    div.contentEditable = true;
    div.setAttribute('data-is-value', 'false');
  }
  
  div.style.left = `${x}px`; 
  div.style.top = `${y}px`; 
  div.style.fontSize = '11px';
  
  const r = document.createElement('div'); 
  r.className = 'resizer'; 
  div.appendChild(r);
  
  makeDraggable(div); 
  makeResizable(div, r); 
  canvas.appendChild(div); 
  saveLayout();
  
  // Focus the blank label when created
  if (text === "Blank Label") {
    div.focus();
  }
}

function makeDraggable(el) {
  // Prevent dragging on child images and SVG elements
  const images = el.getElementsByTagName('img');
  const svgs = el.getElementsByTagName('svg');
  
  for (let img of images) {
    img.draggable = false;
    img.onmousedown = e => e.stopPropagation();
  }
  
  for (let svg of svgs) {
    svg.draggable = false;
    svg.onmousedown = e => e.stopPropagation();
  }
    if (el.classList.contains('barcode-element')) {
    el.querySelector('svg').style.pointerEvents = 'none'; // This allows clicks to pass through SVG
  }

   el.onmousedown = e => {
    // Allow dragging on the barcode container or its resizer
    if (!editMode) return;
    
    // Prevent selection when clicking on SVG (handled by the parent)
    if (e.target.tagName === 'svg') return;
    
    document.querySelectorAll('.label-box').forEach(b => {
      b.classList.remove('selected'); 
      if (b.querySelector('.resizer')) {
        b.querySelector('.resizer').style.display = 'none';
      }
    });
    
    el.classList.add('selected'); 
    selectedElement = el;
    if (el.querySelector('.resizer')) {
      el.querySelector('.resizer').style.display = 'block';
    }
    
    const rect = canvas.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    const elLeft = parseInt(el.style.left) || 0;
    const elTop = parseInt(el.style.top) || 0;
    
    function onMove(ev) {
      const x = (ev.clientX - rect.left - startX) + elLeft;
      const y = (ev.clientY - rect.top - startY) + elTop;
      
      // Constrain to canvas boundaries
      const canvasWidth = parseInt(canvas.style.width);
      const canvasHeight = parseInt(canvas.style.height);
      const elWidth = el.offsetWidth;
      const elHeight = el.offsetHeight;
      
      const constrainedX = Math.max(0, Math.min(x, canvasWidth - elWidth));
      const constrainedY = Math.max(0, Math.min(y, canvasHeight - elHeight));
      
      el.style.left = `${constrainedX}px`;
      el.style.top = `${constrainedY}px`;
      
      drawSnap(el);
    }
    
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      clearSnap();
      saveLayout();
    }
    
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    
    e.preventDefault(); // Prevent text selection during drag
  };
  
  el.oninput = () => saveLayout();
}
function startDrag(e, moveFn, endFn) {
  const rect = canvas.getBoundingClientRect();
  const canvasWidth = parseInt(canvas.style.width);
  const canvasHeight = parseInt(canvas.style.height);
  
  const sx = e.clientX - rect.left - parseInt(e.target.style.left);
  const sy = e.clientY - rect.top - parseInt(e.target.style.top);
  
  function onMove(ev) {
    let x = (ev.clientX - rect.left - sx);
    let y = (ev.clientY - rect.top - sy);
    
    // Constrain to canvas boundaries
    const elWidth = e.target.offsetWidth;
    const elHeight = e.target.offsetHeight;
    
    x = Math.max(0, Math.min(x, canvasWidth - elWidth));
    y = Math.max(0, Math.min(y, canvasHeight - elHeight));
    
    moveFn(`${x}px`, `${y}px`);
  }
  
  function onUp() { 
    document.removeEventListener('mousemove', onMove); 
    document.removeEventListener('mouseup', onUp); 
    endFn(); 
  }
  
  document.addEventListener('mousemove', onMove); 
  document.addEventListener('mouseup', onUp);
}

// Add this to your makeResizable function to regenerate barcode when resized:
function makeResizable(box, handle) {
  handle.onmousedown = e => {
    e.stopPropagation();
    const canvasWidth = parseInt(canvas.style.width);
    const canvasHeight = parseInt(canvas.style.height);
    
    const maxWidth = canvasWidth - box.offsetLeft;
    const maxHeight = canvasHeight - box.offsetTop;
    
    const sw = box.offsetWidth, sh = box.offsetHeight, sx = e.clientX, sy = e.clientY;
    
    // Get aspect ratio for barcode elements
    const isBarcode = box.classList.contains('barcode-element');
    const aspectRatio = isBarcode ? sw / sh : null;
    
    function onMove(ev) {
      let newWidth = Math.min(maxWidth, sw + (ev.clientX - sx));
      let newHeight = Math.min(maxHeight, sh + (ev.clientY - sy));
      
      // For barcode elements, maintain aspect ratio
      if (isBarcode) {
        // Calculate new height based on width change to maintain aspect ratio
        newHeight = newWidth / aspectRatio;
        
        // Ensure we don't exceed canvas boundaries
        if (newHeight > maxHeight) {
          newHeight = maxHeight;
          newWidth = newHeight * aspectRatio;
        }
      }
      
      // Minimum size constraints
      if (newWidth >= 40 && newHeight >= 20) {
        box.style.width = `${newWidth}px`;
        box.style.height = `${newHeight}px`;
        
        // For barcode elements, regenerate the barcode with new size
        if (isBarcode) {
          const svg = box.querySelector('svg');
          if (svg) {
            const value = box.getAttribute('data-barcode-value') || reportData.Barcode || 'DEMO12345';
            svg.innerHTML = ''; // Clear old barcode
            generateBarcode(svg, value);
          }
        }
      }

     
    }
    
    function onUp() { 
      document.removeEventListener('mousemove', onMove); 
      document.removeEventListener('mouseup', onUp); 
      saveLayout(); 
    }
    
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };
}
  
    function drawSnap(el) {
  if (!guideSettings.enabled) return;
  
  clearSnap();
  const others = [...document.querySelectorAll('.label-box')].filter(b => b !== el);
  const r1 = el.getBoundingClientRect();
  const cr = canvas.getBoundingClientRect();
  const distanceValue = document.getElementById('distanceValue');
  
  // Standard alignment guides
  others.forEach(o => {
    const r2 = o.getBoundingClientRect();
    if(Math.abs(r1.left - r2.left) < 8) { 
      yGuide.style.left = `${r2.left - cr.left}px`; 
      yGuide.style.display = 'block'; 
    }
    if(Math.abs(r1.top - r2.top) < 8) { 
      xGuide.style.top = `${r2.top - cr.top}px`; 
      xGuide.style.display = 'block'; 
    }
  });

  // Enhanced centering indicators for lines
  if (el.classList.contains('line-element')) {
    const canvasWidth = parseInt(canvas.style.width);
    const lineWidth = parseInt(el.style.width);
    const lineLeft = parseInt(el.style.left);
    const lineRight = lineLeft + lineWidth;
    
    const leftSpace = lineLeft;
    const rightSpace = canvasWidth - lineRight;
    const isCentered = Math.abs(leftSpace - rightSpace) < 5;
    
    if (isCentered) {
      // Create or get left and right margin indicators
      let leftIndicator = el.querySelector('.margin-indicator.left-margin');
      let rightIndicator = el.querySelector('.margin-indicator.right-margin');
      
      if (!leftIndicator) {
        leftIndicator = document.createElement('div');
        leftIndicator.className = 'margin-indicator left-margin';
        el.appendChild(leftIndicator);
      }
      
      if (!rightIndicator) {
        rightIndicator = document.createElement('div');
        rightIndicator.className = 'margin-indicator right-margin';
        el.appendChild(rightIndicator);
      }
      
      // Position and show the indicators
      leftIndicator.style.left = '0';
      leftIndicator.style.top = '50%';
      leftIndicator.style.transform = 'translate(-50%, -50%)';
      leftIndicator.style.display = 'block';
      
      rightIndicator.style.right = '0';
      rightIndicator.style.top = '50%';
      rightIndicator.style.transform = 'translate(50%, -50%)';
      rightIndicator.style.display = 'block';
      
      // Add pulsing animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.8); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
          100% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.8); }
        }
        .margin-indicator {
          width: 12px;
          height: 12px;
          background: #e74c3c;
          border-radius: 50%;
          position: absolute;
          z-index: 1000;
          animation: pulse 1.5s infinite;
          box-shadow: 0 0 10px rgba(231, 76, 60, 0.8);
        }
        .margin-indicator.right-margin {
          animation-name: pulse-right;
        }
        @keyframes pulse-right {
          0% { opacity: 0.3; transform: translate(50%, -50%) scale(0.8); }
          50% { opacity: 1; transform: translate(50%, -50%) scale(1.2); }
          100% { opacity: 0.3; transform: translate(50%, -50%) scale(0.8); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // New improved distance guides
  if (guideSettings.distanceEnabled && others.length >= 2) {
    // Get all element positions
    const positions = others.map(o => {
      const r = o.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    });

    // Check horizontal spacing patterns
    const sortedX = [...positions].sort((a, b) => a.left - b.left);
    const xSpacings = [];
    
    // Calculate all horizontal spacings between elements
    for (let i = 1; i < sortedX.length; i++) {
      const spacing = sortedX[i].left - sortedX[i-1].left;
      if (spacing >= guideSettings.minSpacing) {
        xSpacings.push(spacing);
      }
    }

    // Check if current element matches any existing horizontal spacing
    xSpacings.forEach(spacing => {
      // Check left side
      positions.forEach(pos => {
        const targetLeft = pos.left - spacing;
        if (Math.abs(r1.left - targetLeft) < 8) {
          yDistanceGuide.style.left = `${targetLeft - cr.left}px`;
          yDistanceGuide.style.display = 'block';
          showDistanceValue(spacing, targetLeft - cr.left, r1.top - cr.top);
        }
      });

      // Check right side
      positions.forEach(pos => {
        const targetLeft = pos.left + spacing;
        if (Math.abs(r1.left - targetLeft) < 8) {
          yDistanceGuide.style.left = `${targetLeft - cr.left}px`;
          yDistanceGuide.style.display = 'block';
          showDistanceValue(spacing, targetLeft - cr.left, r1.top - cr.top);
        }
      });
    });

    // Check vertical spacing patterns
    const sortedY = [...positions].sort((a, b) => a.top - b.top);
    const ySpacings = [];
    
    // Calculate all vertical spacings between elements
    for (let i = 1; i < sortedY.length; i++) {
      const spacing = sortedY[i].top - sortedY[i-1].top;
      if (spacing >= guideSettings.minSpacing) {
        ySpacings.push(spacing);
      }
    }

    // Check if current element matches any existing vertical spacing
    ySpacings.forEach(spacing => {
      // Check top side
      positions.forEach(pos => {
        const targetTop = pos.top - spacing;
        if (Math.abs(r1.top - targetTop) < 8) {
          xDistanceGuide.style.top = `${targetTop - cr.top}px`;
          xDistanceGuide.style.display = 'block';
          showDistanceValue(spacing, r1.left - cr.left, targetTop - cr.top);
        }
      });

      // Check bottom side
      positions.forEach(pos => {
        const targetTop = pos.top + spacing;
        if (Math.abs(r1.top - targetTop) < 8) {
          xDistanceGuide.style.top = `${targetTop - cr.top}px`;
          xDistanceGuide.style.display = 'block';
          showDistanceValue(spacing, r1.left - cr.left, targetTop - cr.top);
        }
      });
    });
  }
}

function showDistanceValue(distance, x, y) {
  const distanceValue = document.getElementById('distanceValue');
  distanceValue.textContent = `${Math.round(distance)}px`;
  distanceValue.style.left = `${x + 10}px`;
  distanceValue.style.top = `${y + 10}px`;
  distanceValue.style.display = 'block';
}

function clearSnap() {
  xGuide.style.display = yGuide.style.display = 'none';
  xDistanceGuide.style.display = yDistanceGuide.style.display = 'none';
  document.getElementById('distanceValue').style.display = 'none';

  // Clear all margin indicators
  document.querySelectorAll('.margin-indicator, .equal-margin-indicator').forEach(ind => {
    ind.style.display = 'none';
  });
}


    

    function saveLayout(){
      localStorage.setItem('builderLayout', JSON.stringify(getLayoutData()));
    }
function getLayoutData() {
  return [...document.querySelectorAll('.label-box')].map(b => {

     const isLine = b.classList.contains('line-element'); 

    const isSignature = b.classList.contains('signature-image');
    const signatureText = isSignature ? b.getAttribute('data-text') || 'Signature' : null;
    
    return {

      text: isLine ? "Line" : 
           (b.innerText || (b.classList.contains('barcode-element') ? "Barcode" : "")),

      text: isSignature ? signatureText : 
           (b.innerText || (b.classList.contains('line-element') ? "Line" : 
           (b.classList.contains('barcode-element') ? "Barcode" : ""))),
      x: parseInt(b.style.left),
      y: parseInt(b.style.top),
      width: isLine ? parseInt(b.style.width) : null,
      height: isLine ? 0 : null,
      isLine:isLine,
      // borderStyle: isLine ? (b.style.borderBottom.includes('dotted') ? 'dotted' : 'solid') : 'solid',
      isBarcode: b.classList.contains('barcode-element'),
      isvalue: b.getAttribute('data-is-value') === 'true',
      fontSize: b.style.fontSize,
      fontColor: b.style.color,
      fontFamily: b.style.fontFamily,
      fontWeight: b.style.fontWeight,
      fontStyle: b.style.fontStyle,
      textDecoration: b.style.textDecoration,
      textAlign: b.style.textAlign,
      isSignature: isSignature || b.getAttribute('data-signature') === 'true',
      displayText: b.getAttribute('data-display-text') || ''
    };
  });
}
// Update the loadLayout function to handle barcode regeneration:
function loadLayout() {
   const data = JSON.parse(localStorage.getItem('builderLayout') || '[]');
  data.forEach(item => {


    // Handle signature images specially
    if (item.isSignature && item.text && item.text.startsWith('Signature:')) {
      const signName = item.text.replace('Signature: ', '');
      createLabel(`signature_image_${signName}`, item.x, item.y);
    } else {
      createLabel(item.isLine ? "Line" : (item.isBarcode ? "Barcode" : item.text), item.x, item.y);
    }
    
    const b = document.querySelectorAll('.label-box').pop();
       if (item.isLine) {
      b.style.width = `${item.width}px`;
      // b.style.borderBottom = '2px dotted #000';
      b.style.height = '0';
    }

   if (item.isvalue !== undefined) {
      b.setAttribute('data-is-value', item.isvalue.toString());
    }

    

    if (item.isLine || item.isBarcode) {
      b.style.width = `${item.width}px`;
      b.style.height = `${item.height}px`;
    }
    
    if (item.isBarcode) {
      // Clear any existing content
      b.innerHTML = '';
      
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "barcode-svg");
      b.appendChild(svg);
      
      const r = document.createElement('div'); 
      r.className = 'resizer'; 
      b.appendChild(r);
      
      // Set the barcode value (use saved value or default)
      const barcodeValue = item.text && item.text !== "Barcode" ? item.text : 
                         (reportData.Barcode || 'DEMO12345');
      b.setAttribute('data-barcode-value', barcodeValue);
      
      // Generate the barcode
      generateBarcode(svg, barcodeValue);
      
      makeDraggable(b);
      makeResizable(b, r);
    }
    
    if (item.isSignature) {
      b.setAttribute('data-signature', 'true');
      b.setAttribute('data-display-text', item.displayText);
      b.contentEditable = false;
    }
  });
}

document.getElementById('canvasContainer').addEventListener('mousedown', e => {
  // Check if we're clicking on a label box or its children (except SVG)
  const isLabelBox = e.target.classList.contains('label-box') || 
                    e.target.classList.contains('resizer') ||
                    e.target.closest('.label-box');
  
  // Special case for SVG inside barcode elements
  const isBarcodeSVG = e.target.tagName === 'svg' && e.target.closest('.barcode-element');
  
  if (!isLabelBox && !isBarcodeSVG) {
    document.querySelectorAll('.label-box').forEach(b => {
      b.classList.remove('selected');
      if (b.querySelector('.resizer')) {
        b.querySelector('.resizer').style.display = 'none';
      }
    });
    selectedElement = null;
  }
  
  // If clicking on SVG inside barcode, select the parent barcode element
  if (isBarcodeSVG) {
    const barcodeElement = e.target.closest('.barcode-element');
    document.querySelectorAll('.label-box').forEach(b => b.classList.remove('selected'));
    barcodeElement.classList.add('selected');
    selectedElement = barcodeElement;
    if (barcodeElement.querySelector('.resizer')) {
      barcodeElement.querySelector('.resizer').style.display = 'block';
    }
  }
});


  