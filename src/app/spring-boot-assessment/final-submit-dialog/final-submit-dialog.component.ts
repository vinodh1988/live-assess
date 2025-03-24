import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-final-submit-dialog',
  templateUrl: './final-submit-dialog.component.html',
  styleUrls: ['./final-submit-dialog.component.css']
})
export class FinalSubmitDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<FinalSubmitDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onConfirm(): void {
    this.dialogRef.close('ok'); // Return "ok" when confirmed
  }

  onCancel(): void {
    this.dialogRef.close('cancel'); // Return "cancel" when canceled
  }
}