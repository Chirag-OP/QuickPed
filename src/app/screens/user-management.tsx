import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Wallet,
  CheckCircle,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { formatCurrency } from '../lib/utils';

export const UserManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const users = [
    {
      id: 1,
      name: 'Rahul Sharma',
      email: 'rahul.sharma@university.edu',
      phone: '+91 98765 43210',
      verified: true,
      walletBalance: 250,
      totalRides: 12,
      memberSince: 'June 2026'
    },
    {
      id: 2,
      name: 'Priya Patel',
      email: 'priya.patel@university.edu',
      phone: '+91 98765 43211',
      verified: true,
      walletBalance: 180,
      totalRides: 23,
      memberSince: 'May 2026'
    },
    {
      id: 3,
      name: 'Amit Kumar',
      email: 'amit.kumar@gmail.com',
      phone: '+91 98765 43212',
      verified: false,
      walletBalance: 50,
      totalRides: 5,
      memberSince: 'June 2026'
    },
    {
      id: 4,
      name: 'Sneha Gupta',
      email: 'sneha.gupta@university.edu',
      phone: '+91 98765 43213',
      verified: true,
      walletBalance: 420,
      totalRides: 45,
      memberSince: 'April 2026'
    },
  ];

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Users className="text-primary" size={32} />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage registered users</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card variant="elevated">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Users</p>
            <p className="text-3xl font-bold">{users.length}</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Verified Users</p>
            <p className="text-3xl font-bold text-success">
              {users.filter(u => u.verified).length}
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Wallet Balance</p>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(users.reduce((sum, u) => sum + u.walletBalance, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <div className="space-y-4">
        {filteredUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card variant="elevated" className="hover:shadow-xl transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold">{user.name}</h3>
                        {user.verified ? (
                          <CheckCircle className="text-success" size={18} />
                        ) : (
                          <XCircle className="text-muted-foreground" size={18} />
                        )}
                      </div>
                      <Badge variant={user.verified ? 'success' : 'default'}>
                        {user.verified ? 'Verified Rider' : 'Regular User'}
                      </Badge>
                    </div>
                  </div>

                  <ChevronRight
                    className="text-muted-foreground group-hover:text-foreground transition-colors"
                    size={24}
                  />
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="text-muted-foreground" size={16} />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="text-muted-foreground" size={16} />
                    <span>{user.phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <Wallet className="mx-auto mb-1 text-primary" size={20} />
                    <p className="text-lg font-bold">{formatCurrency(user.walletBalance)}</p>
                    <p className="text-xs text-muted-foreground">Balance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{user.totalRides}</p>
                    <p className="text-xs text-muted-foreground">Total Rides</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{user.memberSince}</p>
                    <p className="text-xs text-muted-foreground">Member Since</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
