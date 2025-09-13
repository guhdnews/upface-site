import React, { useState, useEffect } from 'react';
import IntranetLayout from '../../../components/intranet/IntranetLayout';
import ProtectedRoute from '../../../components/security/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';
import {
  Clock,
  Play,
  Square,
  Coffee,
  Calendar,
  MapPin,
  Timer,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface TimeEntry {
  id: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breakStart?: string;
  breakEnd?: string;
  totalHours: number;
  status: 'active' | 'completed' | 'break';
  location?: string;
}

export default function TimeClockPage() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockIn, setIsClockIn] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [todayHours, setTodayHours] = useState(0);
  const [weekHours, setWeekHours] = useState(32.5);

  const [timeEntries] = useState<TimeEntry[]>([
    {
      id: '1',
      date: new Date().toISOString().split('T')[0],
      clockIn: '09:00 AM',
      clockOut: undefined,
      totalHours: 0,
      status: 'active',
      location: 'Office - Main'
    },
    {
      id: '2',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      clockIn: '08:45 AM',
      clockOut: '05:30 PM',
      breakStart: '12:00 PM',
      breakEnd: '01:00 PM',
      totalHours: 7.75,
      status: 'completed',
      location: 'Office - Main'
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = () => {
    setIsClockIn(true);
    // In a real app, this would make an API call
    console.log('Clocked in at:', currentTime.toLocaleTimeString());
  };

  const handleClockOut = () => {
    setIsClockIn(false);
    setOnBreak(false);
    // Calculate today's hours
    setTodayHours(8.5);
    console.log('Clocked out at:', currentTime.toLocaleTimeString());
  };

  const handleBreak = () => {
    setOnBreak(!onBreak);
    console.log(onBreak ? 'Break ended' : 'Break started');
  };

  return (
    <ProtectedRoute>
      <IntranetLayout title="Time Clock">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Current Time & Status */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white">
            <div className="text-center">
              <div className="text-6xl font-light mb-2">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-xl mb-6">
                {currentTime.toLocaleDateString([], { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              
              <div className="flex justify-center items-center space-x-4 mb-6">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                  isClockIn ? 'bg-green-500' : 'bg-gray-500'
                }`}>
                  <Clock className="w-5 h-5" />
                  <span>{isClockIn ? 'Clocked In' : 'Clocked Out'}</span>
                </div>
                {onBreak && (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 rounded-full">
                    <Coffee className="w-5 h-5" />
                    <span>On Break</span>
                  </div>
                )}
              </div>

              <div className="flex justify-center space-x-4">
                {!isClockIn ? (
                  <button
                    onClick={handleClockIn}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    <span>Clock In</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleBreak}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                        onBreak 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-yellow-600 hover:bg-yellow-700'
                      }`}
                    >
                      <Coffee className="w-5 h-5" />
                      <span>{onBreak ? 'End Break' : 'Start Break'}</span>
                    </button>
                    <button
                      onClick={handleClockOut}
                      className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
                    >
                      <Square className="w-5 h-5" />
                      <span>Clock Out</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Hours Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Hours</p>
                  <p className="text-2xl font-bold text-gray-900">{todayHours}</p>
                  <p className="text-sm text-blue-600 mt-1">Since 9:00 AM</p>
                </div>
                <Timer className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{weekHours}</p>
                  <p className="text-sm text-green-600 mt-1">of 40 hours</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(weekHours / 40) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overtime</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-500 mt-1">This week</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Time Entries */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Time Entries</h3>
              <div className="space-y-4">
                {timeEntries.map((entry) => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        entry.status === 'active' ? 'bg-green-100 text-green-800' :
                        entry.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {entry.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Clock In</p>
                        <p className="font-medium">{entry.clockIn}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Clock Out</p>
                        <p className="font-medium">{entry.clockOut || 'Active'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Break</p>
                        <p className="font-medium">
                          {entry.breakStart && entry.breakEnd 
                            ? `${entry.breakStart} - ${entry.breakEnd}`
                            : 'None'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total</p>
                        <p className="font-medium">{entry.totalHours || '0'} hrs</p>
                      </div>
                    </div>
                    {entry.location && (
                      <div className="mt-2 flex items-center space-x-1 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{entry.location}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Time Off Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Upcoming Time Off</span>
                </div>
                <p className="text-sm text-yellow-700">
                  You have vacation scheduled for Dec 23-27, 2024
                </p>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="font-medium text-gray-900 mb-4">Quick Actions</h4>
                <div className="space-y-2">
                  <a
                    href="/intranet/hr/timeoff"
                    className="flex items-center space-x-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Request Time Off</span>
                  </a>
                  <button className="flex items-center space-x-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md w-full text-left">
                    <Clock className="w-4 h-4" />
                    <span>View Timesheet</span>
                  </button>
                  <a
                    href="/intranet/hr/payroll"
                    className="flex items-center space-x-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>View Pay Stub</span>
                  </a>
                </div>
              </div>

              {/* Weekly Schedule */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="font-medium text-gray-900 mb-4">This Week's Schedule</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monday</span>
                    <span className="text-gray-500">8:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tuesday</span>
                    <span className="text-gray-500">8:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wednesday</span>
                    <span className="text-gray-500">8:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thursday</span>
                    <span className="text-gray-500">8:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Friday</span>
                    <span className="text-gray-500">8:00 AM - 5:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </IntranetLayout>
    </ProtectedRoute>
  );
}