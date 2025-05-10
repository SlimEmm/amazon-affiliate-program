import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
@Injectable({
  providedIn: 'root',
})
export class UtilService {
  constructor(
    private _location:Location
  ) {}

  updateFormControlValue(event: any, formGroup: FormGroup<any>) {
    formGroup.get(event.source._id)?.setValue(event.source._value);
  }

  updateFormControlValueByField(
    event: any,
    formGroup: FormGroup<any>,
    fieldName: string,
    value: any
  ) {
    formGroup.get(fieldName)?.setValue(value);
  }

  generateDropdownValuesFromEnum(enumValues: any) {
    const formattedValues = Object.entries(enumValues).map(([value, name]) => ({
      name: name,
      value: value,
    }));
    return formattedValues;
  }

  prepareFormData(
    body: any,
    fileKey?: string,
    file?: File | null,
    fileKey2?: string,
    file2?: File | null
  ) {
    let formData: FormData = new FormData();
    fileKey && file && file?.name && formData.append(fileKey, file, file?.name);
    fileKey2 &&
      file2 &&
      file2?.name &&
      formData.append(fileKey2, file2, file2?.name);
    Object.keys(body).forEach((key) => {
      formData.append(key, body[key]);
    });
    return formData;
  }

  convertTime24To12(time24: string) {
    const timeParts = time24?.split(':');
    const hours = Number(timeParts?.[0]);
    const minutes = Number(timeParts?.[1]);
    const seconds = Number(timeParts?.[2].split('.')?.[0]);
    const time = new Date();
    time.setHours(hours);
    time.setMinutes(minutes);
    time.setSeconds(seconds);
    return time;
  }

  copyMessage(val: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = isNaN(date.getMonth())
      ? '00'
      : (date.getMonth() + 1).toString().padStart(2, '0');
    const day = isNaN(date.getDate())
      ? '00'
      : date.getDate().toString().padStart(2, '0');
    const year = isNaN(date.getFullYear())
      ? '0000'
      : date.getFullYear().toString().padStart(4, '0');
    return `${month}/${day}/${year}` &&
      `${month}/${day}/${year}` != '00/00/0000'
      ? `${month}/${day}/${year}`
      : '';
  }

  formatDateAndTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = isNaN(date.getMonth())
      ? '00'
      : (date.getMonth() + 1).toString().padStart(2, '0');
    const day = isNaN(date.getDate())
      ? '00'
      : date.getDate().toString().padStart(2, '0');
    const year = isNaN(date.getFullYear())
      ? '0000'
      : date.getFullYear().toString().padStart(4, '0');

    const hours = isNaN(date.getHours())
      ? '00'
      : date.getHours().toString().padStart(2, '0');
    const minutes = isNaN(date.getMinutes())
      ? '00'
      : date.getMinutes().toString().padStart(2, '0');
    const seconds = isNaN(date.getSeconds())
      ? '00'
      : date.getSeconds().toString().padStart(2, '0');

    return `${month}/${day}/${year}` &&
      `${month}/${day}/${year}` !== '00/00/0000'
      ? `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`
      : '';
  }

  formatClearantDate(dateString: string): string {
    const date = new Date(dateString);
    const month = isNaN(date.getMonth())
      ? '00'
      : (date.getMonth() + 1).toString().padStart(2, '0');
    const day = isNaN(date.getDate())
      ? '00'
      : date.getDate().toString().padStart(2, '0');
    const year = isNaN(date.getFullYear())
      ? '0000'
      : date.getFullYear().toString().padStart(4, '0');
    return `${year}-${month}-${day}`;
  }

  showDate(date: any) {
    return date?.toString()?.split('T')[0] || '';
  }

  focusSection(id: string) {
    document.getElementById(id)?.click();
  }

  increment(
    event: any,
    formGroup: FormGroup<any>,
    fieldName: string,
    max: number
  ) {
    let value = Number(formGroup.get(fieldName)?.value);
    if (!max || value < max) {
      formGroup.get(fieldName)?.setValue(value + 1);
    }
  }

  decrement(
    event: any,
    formGroup: FormGroup<any>,
    fieldName: string,
    min: number
  ) {
    let value = Number(formGroup.get(fieldName)?.value);
    if (value > min) {
      formGroup.get(fieldName)?.setValue(value - 1);
    }
  }

  goBack() {
    this._location.back();
  }

  getNextDayOfWeek(startDate: Date, dayOfWeek: number): Date {
    let resultDate = startDate;
    let daysToAdd = (dayOfWeek + 7 - resultDate.getDay()) % 7;
    if (daysToAdd === 0) {
      daysToAdd = 7;
    }
    resultDate.setDate(resultDate.getDate() + daysToAdd);
    return resultDate;
  }

  getRelativeDate(startDate: Date, nthWeek: number, dayOfWeek: number) {
    let nextMonthStartDay = startDate;
    let resultDate = startDate;
    nextMonthStartDay.setDate(1);
    nextMonthStartDay.setMonth(nextMonthStartDay.getMonth() + 1);
    let daysToAdd =
      ((dayOfWeek + 7 - nextMonthStartDay.getDay()) % 7) +
      (nthWeek < 4 ? nthWeek : 3) * 7;
    let totalDaysInMonth = new Date(
      resultDate.getFullYear(),
      resultDate.getMonth() + 1,
      0
    ).getDate();
    resultDate.setDate(
      resultDate.getDate() +
        daysToAdd +
        (totalDaysInMonth - (resultDate.getDate() + daysToAdd) >= 7 ? 7 : 0)
    );
    return resultDate;
  }

  generateGUID() {
    return `${new Date().getTime()}-${Math.floor(Math.random() * 1000000)}`;
  }

  textEllipsis(text: string, length: number) {
    return (
      text &&
      length &&
      text?.substring(0, length) + (text?.length > length ? '...' : '')
    );
  }

  newDate(date: string) {
    return new Date(date);
  }

  validateSpecificDayOfMonth(form: FormGroup) {
    if (form.value.specificDay > 28) {
      form.get('specificDay')?.setValue(28);
    } else if (form.value.specificDay < 1) {
      form.get('specificDay')?.setValue(1);
    }
  }

  renderToFixed(value: string) {
    return isNaN(Number(value))
      ? 0
      : Number(value || 0) % 1 === 0
      ? Number(value || 0)
      : Number(value || 0)?.toFixed(2);
  }

  handleFileButtonClick(hiddenFileInput: any) {
    hiddenFileInput &&
      hiddenFileInput.nativeElement &&
      hiddenFileInput.nativeElement.click();
  }

  // for input type=number
  validateFloatValue(event: any) {
    const charCode = event.which || event.keyCode;
    // char code of +,-,e
    if (charCode === 43 || charCode === 45 || charCode === 101) {
      event.preventDefault();
    }
  }

  // for input type=text
  validateNumberValue(event: any) {
    const charCode = event.which || event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  validatePercentage(form: FormGroup, fieldName?: string) {
    let percentage = fieldName ? form.value[fieldName] : form.value?.percentage;
    if (percentage < 0 || percentage >= 100) {
      form.get(fieldName || 'percentage')?.setValue(0);
    }
  }

  filterKeyUps(key: string) {
    return ['Alt', 'Control', 'AltGraph', 'Tab'].includes(key);
  }

 toTitleCase(str:string) {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

  textTruncate(text: string, length: number) {
    return text?.length > length
      ? text?.slice(0, length) + '...'
      : text?.slice(0, length);
  }

  public findInvalidControls(form: FormGroup) {
    const invalid = [];
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  public enforceTwoDecimals(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (!/^\d*(\.\d{0,2})?$/.test(value)) {
      input.value = parseFloat(value).toFixed(2).toString();
    }
  }

  public formatLocaleDate(dateString: any) {
    const [datePart, timePart] = dateString.split(', ');
    const [month, day, year] = datePart.split('/');
    const [time, meridian] = timePart.split(' ');
    let [hours, minutes, seconds] = time.split(':');

    // Adjust hours for AM/PM
    hours = parseInt(hours, 10);
    if (meridian === 'PM' && hours !== 12) {
      hours += 12;
    } else if (meridian === 'AM' && hours === 12) {
      hours = 0;
    }

    // Format hours, minutes, and seconds
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.padStart(2, '0');
    const formattedSeconds = seconds.padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    const formattedMonth = month.toString().padStart(2, '0');

    // Return the formatted string
    return `${year}-${formattedMonth}-${formattedDay}T${formattedHours}:${formattedMinutes}:${formattedSeconds}.000`;
  }

  public noWhitespaceValidator(control: FormControl) {
    return (control.value || '')?.trim().length ? null : { whitespace: true };
  }

  public findDuplicateString(arr: any) {
    return arr.filter(
      (item: any, index: number) => arr.indexOf(item) !== index
    );
  }

  validateEmails(emails: string[]): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emails.every((email) => emailPattern.test(email));
  }
}
