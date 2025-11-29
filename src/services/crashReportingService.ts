import { db  from '../services/firebaseService';
import { 
  collection, 
  addDoc, 
  Timestamp
 from 'firebase/firestore';

interface CrashReport {
  id?: string;
  userId?: string;
  errorMessage: string;
  errorStack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  platform: string;
  appVersion: string;
  timestamp: Timestamp;
  resolved: boolean;
  resolutionNotes?: string;


export class CrashReportingService {
  private static COLLECTION_NAME = 'crashReports';
  private static enabled = true;
  
  /**
   * Initialize crash reporting
   */
  static initialize(): void {
    if (typeof window !== 'undefined') {
      // Capture unhandled errors
      window.addEventListener('error', (event) => {
        if (this.enabled) {
          this.reportError({
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error,
          );
        
      );
      
      // Capture unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        if (this.enabled) {
          this.reportError({
            message: 'Unhandled Promise Rejection',
            error: event.reason,
          );
        
      );
    
  
  
  /**
   * Report an error
   */
  static async reportError(errorInfo: {
    message: string;
    filename?: string;
    lineno?: number;
    colno?: number;
    error?: Error;
  ): Promise<boolean> {
    try {
      const report: any = {
        errorMessage: errorInfo.message,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
        appVersion: process.env.APP_VERSION || '1.0.0',
        timestamp: Timestamp.now(),
        resolved: false,
      ;
      
      // Add error details if available
      if (errorInfo.error) {
        report.errorStack = errorInfo.error.stack;
        report.errorMessage = errorInfo.error.message || report.errorMessage;
      
      
      // Add location info
      if (errorInfo.filename) {
        report.errorMessage += ` (${errorInfo.filename:${errorInfo.lineno:${errorInfo.colno)`;
      
      
      await addDoc(collection(db, this.COLLECTION_NAME), report);
      console.log('Crash report submitted successfully');
      return true;
     catch (error) {
      console.error('Error submitting crash report:', error);
      return false;
    
  
  
  /**
   * Report a React error
   */
  static async reportReactError(
    error: Error, 
    componentStack?: string,
    userId?: string
  ): Promise<boolean> {
    try {
      const report: any = {
        userId,
        errorMessage: error.message,
        errorStack: error.stack,
        componentStack,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
        appVersion: process.env.APP_VERSION || '1.0.0',
        timestamp: Timestamp.now(),
        resolved: false,
      ;
      
      await addDoc(collection(db, this.COLLECTION_NAME), report);
      console.log('React error report submitted successfully');
      return true;
     catch (error) {
      console.error('Error submitting React error report:', error);
      return false;
    
  
  
  /**
   * Enable/disable crash reporting
   */
  static setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  
  
  /**
   * Get app information
   */
  static getAppInfo(): any {
    return {
      appVersion: process.env.APP_VERSION || '1.0.0',
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    ;
  


// Initialize crash reporting
CrashReportingService.initialize();

export default CrashReportingService;