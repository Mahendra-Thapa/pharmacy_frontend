'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutGrid,
  Search,
  Trash2,
  Edit,
  Save,
  Plus,
  AlertTriangle,
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { TbPointFilled } from "react-icons/tb";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

import { useAdmin } from '@/lib/admin-context'
import { axiosInstance } from '@/utils/axiosSetup'

import { toast } from 'react-hot-toast'

export default function CategoriesPage() {
  const { categories, inventory, loading, refresh } =
    useAdmin()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [isDialogOpen, setIsDialogOpen] =
    useState(false)

  const [isDeleteOpen, setIsDeleteOpen] =
    useState(false)

  const [selectedCat, setSelectedCat] =
    useState<any>(null)

  const [formData, setFormData] = useState<any>({})

  const [submitting, setSubmitting] =
    useState(false)

  const filtered = categories.filter((c: any) =>
    (c.name || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const rootCats = filtered.filter(
    (c: any) => !c.parent
  )

  const itemsPerPage = 8

  const totalPages = Math.ceil(
    rootCats.length / itemsPerPage
  )

  const openAdd = () => {
    setSelectedCat(null)

    setFormData({
      name: '',
      description: '',
      parent: '',
    })

    setIsDialogOpen(true)
  }

  const openEdit = (cat: any) => {
    setSelectedCat(cat)

    setFormData({
      ...cat,
      parent: cat.parent || '',
      description: cat.description || '',
      name: cat.name || '',
    })

    setIsDialogOpen(true)
  }

  const openDelete = (cat: any) => {
    setSelectedCat(cat)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setSubmitting(true)

    try {
      const payload = { ...formData }

      if (!payload.parent) {
        delete payload.parent
      }

      if (selectedCat) {
        await axiosInstance.patch(
          `/categories/${selectedCat.id}/`,
          payload
        )

        toast.success('Category updated')
      } else {
        await axiosInstance.post(
          '/categories/',
          payload
        )

        toast.success('Category added')
      }

      setIsDialogOpen(false)

      refresh()
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          'Failed to save category'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setSubmitting(true)

    try {
      await axiosInstance.delete(
        `/categories/${selectedCat.id}/`
      )

      toast.success('Category deleted')

      setIsDeleteOpen(false)

      refresh()
    } catch {
      toast.error('Failed to delete category')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center text-sm text-gray-500">
        Loading categories...
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Card className="overflow-hidden rounded-3xl border border-gray-100 shadow-none">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-gray-100 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
              <LayoutGrid
                size={22}
                className="text-emerald-600"
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Categories
              </h2>

              <p className="text-sm text-gray-500">
                Manage medicine categories
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <Input
                placeholder="Search category..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="h-11 rounded-xl pl-10"
              />
            </div>

            <Button
              onClick={openAdd}
              className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus size={16} className="mr-2" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">
                  Name
                </TableHead>

                <TableHead>Type</TableHead>

                <TableHead>Products</TableHead>

                <TableHead className="pr-6 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {(() => {
                const paginatedRoots = rootCats.slice(
                  (page - 1) * itemsPerPage,
                  page * itemsPerPage
                )

                const children = categories.filter(
                  (c: any) => c.parent
                )

                return paginatedRoots.map((root: any) => (
                  <React.Fragment key={root.id}>
                    {/* Root */}
                    <TableRow>
                      <TableCell className="pl-6 font-medium text-gray-900">
                        {root.name}
                      </TableCell>

                      <TableCell>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                          Main
                        </span>
                      </TableCell>

                      <TableCell>
                        {
                          inventory.filter(
                            (i: any) =>
                              i.category === root.id
                          ).length
                        }
                      </TableCell>

                      <TableCell className="pr-6">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              openEdit(root)
                            }
                            className="rounded-xl"
                          >
                            <Edit size={16} />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              openDelete(root)
                            }
                            className="rounded-xl text-red-500 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Children */}
                    {children
                      .filter(
                        (child: any) =>
                          child.parent === root.id
                      )
                      .map((child: any) => (
                        <TableRow key={child.id}>
                          <TableCell className="pl-12 text-gray-600 flex items-center gap-2">
                            <TbPointFilled />
 {child.name}
                          </TableCell>

                          <TableCell>
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                              Sub
                            </span>
                          </TableCell>

                          <TableCell>
                            {
                              inventory.filter(
                                (i: any) =>
                                  i.category ===
                                  child.id
                              ).length
                            }
                          </TableCell>

                          <TableCell className="pr-6">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  openEdit(child)
                                }
                                className="rounded-xl"
                              >
                                <Edit size={14} />
                              </Button>

                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  openDelete(child)
                                }
                                className="rounded-xl text-red-500 hover:text-red-600"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </React.Fragment>
                ))
              })()}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 p-5">
            <Button
              variant="outline"
              onClick={() =>
                setPage((p) => Math.max(1, p - 1))
              }
              disabled={page === 1}
              className="rounded-xl"
            >
              Previous
            </Button>

            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>

            <Button
              variant="outline"
              onClick={() =>
                setPage((p) =>
                  Math.min(totalPages, p + 1)
                )
              }
              disabled={page === totalPages}
              className="rounded-xl"
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        <DialogContent className="rounded-3xl border-none p-0 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="border-b border-gray-100 p-6">
              <DialogTitle className="text-xl font-semibold">
                {selectedCat
                  ? 'Edit Category'
                  : 'Add Category'}
              </DialogTitle>

              <DialogDescription className="mt-1 text-sm text-gray-500">
                Fill in the category information below.
              </DialogDescription>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category Name
                </label>

                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="h-11 rounded-xl"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Parent Category
                </label>

                <select
                  value={formData.parent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parent: e.target.value,
                    })
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 outline-none"
                >
                  <option value="">
                    No Parent
                  </option>

                  {categories
                    .filter(
                      (c: any) =>
                        c.id !== selectedCat?.id &&
                        !c.parent
                    )
                    .map((c: any) => (
                      <option
                        key={c.id}
                        value={c.id}
                      >
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description:
                        e.target.value,
                    })
                  }
                  placeholder="Write description..."
                  className="min-h-[120px] w-full rounded-2xl border border-gray-200 p-4 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 p-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setIsDialogOpen(false)
                }
                className="rounded-xl"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
              >
                <Save size={16} className="mr-2" />

                {submitting
                  ? 'Saving...'
                  : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      >
        <DialogContent className="max-w-md rounded-3xl border-none p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle
                size={28}
                className="text-red-500"
              />
            </div>

            <DialogTitle className="text-xl font-semibold">
              Delete Category?
            </DialogTitle>

            <DialogDescription className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete{' '}
              <span className="font-medium text-gray-900">
                {selectedCat?.name}
              </span>
              ?
            </DialogDescription>

            <div className="mt-8 flex w-full gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setIsDeleteOpen(false)
                }
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>

              <Button
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 rounded-xl bg-red-500 hover:bg-red-600"
              >
                {submitting
                  ? 'Deleting...'
                  : 'Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}